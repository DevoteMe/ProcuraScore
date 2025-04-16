import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// WARNING: Never expose your service role key publicly!
// Use environment variables securely configured in your Supabase project settings.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client configured to use service_role key
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } } // Prevent storing session for server-side client
    )

    // 1. Verify the caller is a platform admin
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization Header')
    }
    const jwt = authHeader.replace('Bearer ', '')

    // Get user details from the JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    if (userError || !user) {
       console.error('Auth Error:', userError)
       throw new Error('Authentication failed')
    }

    // Check for the admin claim (adjust 'claims_admin' if your claim name is different)
    const isPlatformAdmin = user.app_metadata?.claims_admin === true
    if (!isPlatformAdmin) {
      console.warn(`Non-admin user ${user.id} attempted to list users.`)
      return new Response(JSON.stringify({ error: 'Permission denied: Not a platform admin' }), {
        status: 403, // Forbidden
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Admin user ${user.id} requesting user list.`)

    // 2. Fetch all users using the admin client
    // Adjust pagination as needed for large user bases
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
       page: 1,
       perPage: 1000, // Fetch up to 1000 users initially
    });

    if (listError) {
      console.error('Error listing users:', listError)
      throw listError
    }

    // TODO: Optionally enrich user data here by fetching from 'profiles'
    // For example, fetch profiles matching the user IDs and merge the data.
    // This requires an additional query. For simplicity now, we return auth data.
    // Example enrichment (uncomment and adapt if needed):
    /*
    const userIds = usersData.users.map(u => u.id);
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, tenant_id') // Select needed profile fields
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Decide how to handle: return partial data or throw error?
      // For now, log error but continue with auth data
    }

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

    const enrichedUsers = usersData.users.map(user => ({
      ...user, // Spread auth user data
      profile: profilesMap.get(user.id) || null, // Add profile data if found
    }));
    */

    // Return the list of users (using auth data for now)
    return new Response(JSON.stringify({ users: usersData.users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Function Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Internal Server Error
    })
  }
})
