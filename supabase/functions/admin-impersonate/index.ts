// ** supabase/functions/admin-impersonate/index.ts **
// Allows a Platform Admin to generate a session for another user.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts' // Assuming a shared CORS config

// Helper function to check if the caller is a platform admin
// IMPORTANT: This relies on the JWT containing the correct claim/metadata.
// Adjust 'is_platform_admin' or 'claims_admin' based on your setup in sql/schema.sql::is_platform_admin()
async function isCallerPlatformAdmin(supabaseClient: SupabaseClient): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      console.error('Impersonate check: Error getting user or no user found', error);
      return false;
    }
    // Check both user_metadata and app_metadata (claims_admin is often in app_metadata)
    const isUserMetaAdmin = user.user_metadata?.is_platform_admin === true;
    const isAppMetaAdmin = user.app_metadata?.claims_admin === true; // Check for 'claims_admin'
    console.log(`Admin check for ${user.id}: user_metadata.is_platform_admin=${isUserMetaAdmin}, app_metadata.claims_admin=${isAppMetaAdmin}`);
    return isUserMetaAdmin || isAppMetaAdmin;
  } catch (e) {
    console.error('Impersonate check: Exception during admin check', e);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase client with the caller's Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use Anon key
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } } // Pass Auth header
    )

    // 2. Verify the caller is a Platform Admin
    const isAdmin = await isCallerPlatformAdmin(supabaseClient);
    if (!isAdmin) {
      console.warn('Impersonate attempt by non-admin');
      return new Response(JSON.stringify({ error: 'Permission denied: Not a platform admin.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Get the target user ID from the request body
    const { targetUserId } = await req.json();
    if (!targetUserId || typeof targetUserId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid targetUserId in request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Initialize Supabase Admin Client to perform the impersonation action
    //    Requires SUPABASE_SERVICE_ROLE_KEY.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Generate a new session for the target user
    //    WARNING: Using admin.generateLink is generally safer if applicable,
    //    but it's designed for email links. For direct session generation,
    //    creating a custom token or potentially using undocumented/internal methods
    //    might be needed, which carries risks.
    //    A common (but potentially less secure or stable) approach is to
    //    temporarily update the target user's password, sign in, then revert.
    //    Let's illustrate generating a *new* session token directly if possible,
    //    acknowledging this might require internal API knowledge or future Supabase features.
    //
    //    SAFER ALTERNATIVE: Consider if `admin.generateLink` with type 'magiclink'
    //    could be adapted, although it usually requires email interaction.
    //
    //    USING A HYPOTHETICAL (OR FUTURE) DIRECT SESSION GENERATION:
    //    This part is speculative as Supabase doesn't have a documented public API
    //    for `admin.createSessionForUser(userId)` as of late 2023/early 2024.
    //    If such an API exists or becomes available, use it.
    //    If not, you might need to explore custom JWT creation using the JWT secret
    //    (HIGH RISK - AVOID IF POSSIBLE) or the password reset flow mentioned above.

    //    Let's assume a hypothetical direct method for illustration:
    //    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin // Hypothetical namespace
    //        .createSessionForUser(targetUserId, { expiresIn: 3600 }); // e.g., 1 hour expiry

    //    FALLBACK: Using undocumented `_signInWithPassword` (use with extreme caution, may break)
    //    This requires knowing *something* about the user that can be used to sign in,
    //    or temporarily setting/resetting their password via the admin API.
    //    This is complex and has security implications.

    //    MOST PRACTICAL (BUT REQUIRES JWT SECRET - HIGH RISK): Manually create a JWT.
    //    This requires the `SUPABASE_JWT_SECRET`. Avoid this if possible.
    /*
    import * as djwt from "https://deno.land/x/djwt@v2.8/mod.ts"; // Example JWT library

    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) throw new Error('JWT Secret not configured');

    const targetUser = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (!targetUser.data.user) throw new Error('Target user not found');

    const payload = {
      sub: targetUserId,
      aud: 'authenticated', // Or appropriate audience
      role: 'authenticated', // Or appropriate role
      email: targetUser.data.user.email,
      // Include necessary app_metadata or user_metadata if needed by RLS
      // user_metadata: targetUser.data.user.user_metadata,
      // app_metadata: targetUser.data.user.app_metadata,
      session_id: crypto.randomUUID(), // Generate a unique session ID
      iss: `https://<your-project-ref>.supabase.co/auth/v1`, // IMPORTANT: Set correct issuer
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    };
    const header: djwt.Header = { alg: "HS256", typ: "JWT" };
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
    );
    const accessToken = await djwt.create(header, payload, key);

    // NOTE: This manually created token won't have a corresponding refresh token
    // or session entry in Supabase's internal auth schema unless you create one,
    // making it less robust than a native session.
    const sessionData = { session: { access_token: accessToken, token_type: 'bearer', user: targetUser.data.user, expires_in: 3600 } };
    const sessionError = null;
    */

    // --> Due to lack of a safe, documented method, returning an error for now.
    // --> Replace with a real implementation if Supabase provides one or if you accept the risks of custom JWTs.
     console.error("Direct user session generation is not safely supported via documented APIs. Impersonation failed.");
     return new Response(JSON.stringify({ error: 'Impersonation feature requires a supported mechanism (e.g., future Supabase API or accepting risks of custom JWTs).' }), {
       status: 501, // Not Implemented
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     })

    // --- Resume assuming sessionData and sessionError exist from a valid method ---
    /*
    if (sessionError || !sessionData.session) {
      console.error('Impersonation Error:', sessionError?.message || 'Failed to create session');
      return new Response(JSON.stringify({ error: `Impersonation failed: ${sessionError?.message || 'Could not create session'}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Admin ${req.headers.get('Authorization')?.substring(0, 15)}... impersonated user ${targetUserId}`);

    // 6. Return the new session (access token, refresh token, user details)
    return new Response(JSON.stringify(sessionData), { // Return the full session object
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
    */

  } catch (error) {
    console.error('Impersonate Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/*
Usage Notes:
1. Deploy this function (`supabase functions deploy admin-impersonate`). JWT verification IS required by default.
2. Call this function from your frontend Admin Panel, passing the `targetUserId` in the JSON body. Ensure the fetch request includes the Platform Admin's `Authorization: Bearer <token>` header.
3. The frontend receives the new session object (containing access_token, refresh_token, user details for the impersonated user).
4. Use `supabase.auth.setSession()` on the frontend with the received access and refresh tokens to switch the app's context to the impersonated user.
5. **CRITICAL SECURITY**:
    - Ensure the `isCallerPlatformAdmin` check is robust and correctly identifies admins based on your chosen metadata/claim.
    - The `SUPABASE_SERVICE_ROLE_KEY` must be kept secret.
    - **AVOID using `SUPABASE_JWT_SECRET` for manual JWT creation if at all possible.** Explore alternatives or wait for official Supabase support for safer impersonation.
    - Implement clear UI indicators on the frontend when a session is being impersonated.
    - Provide a secure way to *stop* impersonating (e.g., logging out, or a dedicated "stop impersonating" function that restores the original admin session if feasible). Logging out is the simplest.
*/
