import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Admin List Users function initializing.");

// WARNING: Never expose your service role key publicly!
// Use environment variables securely configured in your Supabase project settings.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

// Helper to create client with user's auth token
function createSupabaseClient(req: Request): SupabaseClient | null {
    const authHeader = req.headers.get('Authorization')
    // If no auth header, return null - allows checking later
    if (!authHeader) {
        return null;
    }
    return createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
    );
}

// Admin client using Service Role Key
const supabaseAdmin = createClient(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
);

// Determine if running in a development-like environment
// Supabase often sets APP_ENV=development locally/previews
// Adjust this check if your environment variable is different
const isDevelopment = Deno.env.get('APP_ENV') === 'development';
console.log(`Function environment detected as: ${isDevelopment ? 'Development' : 'Production'}`);

serve(async (req) => {
    console.log("Admin List Users function invoked.");

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        console.log("Handling OPTIONS request.");
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        let isAdminVerified = false;

        // --- Development Bypass for Auth Check ---
        if (isDevelopment) {
            console.warn('[admin-list-users] Development mode: Bypassing authentication check.');
            isAdminVerified = true; // Skip the check and proceed
        } else {
            // --- Production Auth Check ---
            const supabase = createSupabaseClient(req);
            if (!supabase) {
                throw new Error('Authentication error: Missing Authorization header');
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) throw new Error(`Authentication error: ${userError.message}`);
            if (!user) throw new Error('Authentication error: No user found');
            if (user.app_metadata?.is_platform_admin !== true) {
                throw new Error('Forbidden: User is not a Platform Admin');
            }
            isAdminVerified = true;
            console.log(`User ${user.email} authenticated as Platform Admin.`);
        }
        // --- End Auth Check Logic ---

        if (!isAdminVerified) {
             // Should not happen with current logic, but as a safeguard
             throw new Error("Assertion failed: Admin status not verified.");
        }

        console.log("Proceeding to fetch users...");

        // 2. Fetch all users using the admin client
        // Note: Adjust pagination if expecting a very large number of users
        const { data: usersData, error: fetchError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000, // Adjust as needed, max 1000 per page for listUsers
        });

        if (fetchError) {
            console.error("Error fetching users:", fetchError.message);
            throw fetchError;
        }

        const users = usersData?.users || [];
        console.log(`Successfully fetched ${users.length} users.`);

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
        return new Response(JSON.stringify({ users }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error("Caught error in function:", error.message);
        const status = error.message.startsWith('Forbidden') ? 403 : error.message.startsWith('Authentication') ? 401 : 500;
        return new Response(JSON.stringify({ error: error.message }), {
            status: status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

console.log("Admin List Users function initialized and serving.");
