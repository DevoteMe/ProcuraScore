import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Admin List Tenants function initializing.");

// Helper to create client with user's auth token
function createSupabaseClient(req: Request): SupabaseClient {
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
        throw new Error('Missing Authorization header');
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
        // 1. Create client with user's JWT to verify identity and role
        const supabase = createSupabaseClient(req);

        // 2. Get user and check for admin role
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Auth error:", userError.message);
            return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        if (!user) {
             console.error("Auth error: No user found for token");
            return new Response(JSON.stringify({ error: 'Authentication error: No user found' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Check for Platform Admin status in app_metadata
        if (user.app_metadata?.is_platform_admin !== true) {
            console.warn(`Forbidden: User ${user.email} is not a Platform Admin.`);
            return new Response(JSON.stringify({ error: 'Forbidden: User is not a Platform Admin' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`User ${user.email} authenticated as Platform Admin. Fetching tenants...`);

        // 3. Fetch all tenants using the admin client (bypasses RLS)
        const { data: tenants, error: fetchError } = await supabaseAdmin
            .from('tenants')
            .select('id, name, created_at, stripe_customer_id'); // Select desired columns

        if (fetchError) {
            console.error("Error fetching tenants:", fetchError.message);
            throw fetchError; // Let the generic error handler catch it
        }

        console.log(`Successfully fetched ${tenants?.length ?? 0} tenants.`);

        // 4. Return the tenants
        return new Response(JSON.stringify({ tenants }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Caught error in function:", error.message);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

console.log("Admin List Tenants function initialized and serving."); 