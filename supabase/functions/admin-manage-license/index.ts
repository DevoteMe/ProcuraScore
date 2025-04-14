// ** supabase/functions/admin-manage-license/index.ts **
// Example function for Platform Admins to manage licenses (e.g., manual creation).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Helper function to check if the caller is a platform admin (same as in admin-impersonate)
async function isCallerPlatformAdmin(supabaseClient: SupabaseClient): Promise<boolean> {
   try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) return false;
    const isUserMetaAdmin = user.user_metadata?.is_platform_admin === true;
    const isAppMetaAdmin = user.app_metadata?.claims_admin === true;
    return isUserMetaAdmin || isAppMetaAdmin;
  } catch (e) {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase client with caller's Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Verify caller is Platform Admin
    const isAdmin = await isCallerPlatformAdmin(supabaseClient);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Permission denied: Not a platform admin.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Get license details from request body (example: creating a manual license)
    const { tenantId, licenseType, status, projectId, maxUsers, periodEnd } = await req.json();

    // Basic validation
    if (!tenantId || !licenseType || !status) {
        return new Response(JSON.stringify({ error: 'Missing required fields: tenantId, licenseType, status.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    if (licenseType === 'per_tender' && !projectId) {
         return new Response(JSON.stringify({ error: 'Missing projectId for per_tender license.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
     if (licenseType === 'subscription' && (!maxUsers || !periodEnd)) {
         return new Response(JSON.stringify({ error: 'Missing maxUsers or periodEnd for subscription license.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }


    // 4. Initialize Supabase Admin Client for database operation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Perform the database operation (e.g., insert a new license)
    let dbOperation;
    if (licenseType === 'per_tender') {
        dbOperation = supabaseAdmin.from('licenses').insert({
            tenant_id: tenantId,
            type: 'per_tender',
            status: status,
            project_id: projectId,
            // Manually created licenses won't have Stripe IDs
        });
    } else if (licenseType === 'subscription') {
         dbOperation = supabaseAdmin.from('licenses').insert({
            tenant_id: tenantId,
            type: 'subscription',
            status: status,
            max_users: maxUsers,
            current_period_end: periodEnd, // Assuming start is now or not relevant for manual add
            current_period_start: new Date().toISOString(), // Set start to now
             // Manually created licenses won't have Stripe IDs
        });
    } else {
         return new Response(JSON.stringify({ error: 'Invalid licenseType.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const { data, error } = await dbOperation.select().single(); // Return the created license

    if (error) {
      console.error('Admin Manage License Error:', error);
      return new Response(JSON.stringify({ error: `Database operation failed: ${error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Admin performed license management action: created license ${data.id}`);

    // 6. Return success response
    return new Response(JSON.stringify({ success: true, license: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Admin Manage License Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/*
Usage Notes:
1. Deploy this function (`supabase functions deploy admin-manage-license`). JWT verification required.
2. Call from Admin Panel UI, passing necessary license details in the JSON body and the admin's Auth header.
3. Extend this function to handle other actions (update, delete) based on request parameters or different endpoints.
4. Ensure robust validation of input data.
5. Requires `SUPABASE_SERVICE_ROLE_KEY` secret.
*/
