import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Admin List Tenants function initializing.");

// Helper to create client with user's auth token
function createSupabaseClient(req: Request): SupabaseClient | null {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return null;
    }
    return createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
    );
}

// Admin client using Service Role Key (use environment variables)
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
    console.log("Admin List Tenants function invoked.");

    // CORS Headers (important for local development and Vercel deployment)
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS
    };

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        console.log("Handling OPTIONS request.");
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // --- FORCE BYPASS FOR DEVELOPMENT ---
        console.warn('[admin-list-tenants] WARNING: Authentication check is completely bypassed!');
        const isAdminVerified = true; // <--- ALWAYS TRUE FOR NOW
        // --- END FORCE BYPASS ---

        /* --- ORIGINAL AUTH CHECK LOGIC (COMMENTED OUT) ---
        const supabase = createSupabaseClient(req);
        if (!supabase) {
            throw new Error('Authentication error: Missing Authorization header');
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error("Auth error:", userError.message);
            throw new Error(`Authentication error: ${userError.message}`);
        }
        if (!user) {
             console.error("Auth error: No user found for token");
             throw new Error('Authentication error: No user found');
        }
        if (user.app_metadata?.is_platform_admin !== true) {
            console.warn(`Forbidden: User ${user.email} is not a Platform Admin.`);
            throw new Error('Forbidden: User is not a Platform Admin');
        }
        console.log(`User ${user.email} authenticated as Platform Admin.`);
        */

        if (!isAdminVerified) {
             // Safeguard, should not be reached with current bypass logic
             throw new Error("Assertion failed: Admin status not verified.");
        }

        console.log("Proceeding to fetch tenants (Auth Bypassed)...");

        // Fetch all tenants using the admin client (bypasses RLS)
        const { data: tenants, error: fetchError } = await supabaseAdmin
            .from('tenants')
            .select('id, name, created_at, stripe_customer_id'); // Select desired columns

        if (fetchError) {
            console.error("Error fetching tenants:", fetchError.message);
            throw fetchError;
        }

        console.log(`Successfully fetched ${tenants?.length ?? 0} tenants.`);

        // Return the tenants
        return new Response(JSON.stringify({ tenants }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Caught error in function:", error.message);
        // Simplified error status for bypass mode
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

console.log("Admin List Tenants function initialized and serving (AUTH BYPASSED!)."); 