// 3. Detailed Edge Function Logic (TypeScript Example)

// ** supabase/functions/stripe-webhooks/index.ts **
// Handles incoming webhooks from Stripe to update license status.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.16.0?target=deno' // Use Deno-compatible Stripe build
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase Admin Client (use environment variables)
// IMPORTANT: These secrets are managed in Supabase project settings, NOT committed to code.
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use Service Role Key for admin actions
)

// Initialize Stripe (use environment variables)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16', // Use a fixed API version
  httpClient: Stripe.createFetchHttpClient(), // Use Deno's fetch
})

// Get Stripe webhook secret (use environment variables)
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  if (!signature) {
    return new Response('Missing Stripe-Signature header', { status: 400 })
  }
  if (!stripeWebhookSecret) {
      console.error('Stripe webhook secret is not set in environment variables.');
      return new Response('Webhook Error: Server configuration missing', { status: 500 });
  }

  let event: Stripe.Event
  try {
    // Verify the webhook signature
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret,
      undefined, // Optional tolerance
      Stripe.createSubtleCryptoProvider() // Use Deno's SubtleCrypto
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // --- Handle Specific Stripe Events ---
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // Metadata expected to contain tenant_id and license_type (and project_id if per_tender)
        const tenantId = session.metadata?.tenant_id;
        const licenseType = session.metadata?.license_type as 'per_tender' | 'subscription';
        const projectId = session.metadata?.project_id; // Only for per_tender
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

        if (!tenantId || !licenseType || !stripeCustomerId) {
            console.error('Missing required metadata (tenant_id, license_type) or customer ID in checkout session:', session.id);
            return new Response('Webhook Error: Missing metadata or customer ID.', { status: 400 });
        }

        // Update Tenant with Stripe Customer ID if not already set
        const { error: tenantUpdateError } = await supabaseAdmin
            .from('tenants')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', tenantId)
            .is('stripe_customer_id', null); // Only update if null

        if (tenantUpdateError) {
            console.error('Error updating tenant with Stripe customer ID:', tenantUpdateError);
            // Decide if this is critical enough to fail the webhook
        }

        if (licenseType === 'subscription' && stripeSubscriptionId) {
          // Subscription created via Checkout
          console.log(`Handling subscription creation for tenant ${tenantId}, sub ID: ${stripeSubscriptionId}`);
          // Fetch subscription details to get period end, max users etc.
           const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
           const maxUsers = parseInt(subscription.metadata?.max_users || '1', 10); // Get max users from subscription metadata or default

          const { error } = await supabaseAdmin.from('licenses').insert({
            tenant_id: tenantId,
            type: 'subscription',
            status: 'active', // Assuming immediate activation
            stripe_subscription_id: stripeSubscriptionId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            max_users: maxUsers,
          });
          if (error) throw new Error(`Failed to insert subscription license: ${error.message}`);
          console.log(`Subscription license created for tenant ${tenantId}`);

        } else if (licenseType === 'per_tender') {
          // One-time purchase (per-tender license)
          if (!projectId) {
             console.error('Missing project_id in metadata for per_tender license:', session.id);
             return new Response('Webhook Error: Missing project_id for per_tender license.', { status: 400 });
          }
          console.log(`Handling per-tender license creation for tenant ${tenantId}, project ${projectId}`);
          const { error } = await supabaseAdmin.from('licenses').insert({
            tenant_id: tenantId,
            type: 'per_tender',
            status: 'active', // Assuming immediate activation
            project_id: projectId,
            // No subscription details needed
          });
          if (error) throw new Error(`Failed to insert per-tender license: ${error.message}`);
           console.log(`Per-tender license created for tenant ${tenantId}, project ${projectId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        // Used for recurring subscription payments
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (invoice.billing_reason === 'subscription_cycle' && subscriptionId) {
          console.log(`Handling subscription renewal for sub ID: ${subscriptionId}`);
          // Fetch the subscription to get the latest period dates
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const { error } = await supabaseAdmin
            .from('licenses')
            .update({
              status: 'active', // Ensure it's active
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
          if (error) throw new Error(`Failed to update license on renewal: ${error.message}`);
          console.log(`Subscription license renewed for sub ID: ${subscriptionId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice.id);
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          console.log(`Handling failed payment for sub ID: ${subscriptionId}`);
          // Mark license as inactive or requires action (depends on Stripe settings for retries)
          const { error } = await supabaseAdmin
            .from('licenses')
            .update({ status: 'inactive', updated_at: new Date().toISOString() }) // Or a specific 'payment_failed' status
            .eq('stripe_subscription_id', subscriptionId);
          if (error) console.error(`Failed to update license status on payment failure: ${error.message}`);
          else console.log(`Subscription license marked inactive for sub ID: ${subscriptionId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        // Handle plan changes, cancellations initiated in Stripe, etc.
        const status = subscription.status; // e.g., 'active', 'past_due', 'canceled', 'unpaid'
        const maxUsers = parseInt(subscription.metadata?.max_users || '1', 10); // Update max users on plan change

        let licenseStatus: 'active' | 'inactive' | 'cancelled' = 'inactive'; // Default
        if (status === 'active') licenseStatus = 'active';
        else if (status === 'canceled') licenseStatus = 'cancelled';
        // other statuses like 'past_due', 'unpaid' might map to 'inactive'

        const { error } = await supabaseAdmin
          .from('licenses')
          .update({
            status: licenseStatus,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            max_users: maxUsers,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        if (error) throw new Error(`Failed to update license on subscription update: ${error.message}`);
        console.log(`Subscription license updated for sub ID: ${subscription.id}, status: ${licenseStatus}`);
        break;
      }

       case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted (cancelled at period end or immediately):', subscription.id);
        // Mark the license as cancelled or inactive
         const { error } = await supabaseAdmin
            .from('licenses')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() }) // Or 'inactive' depending on desired state
            .eq('stripe_subscription_id', subscription.id);
         if (error) console.error(`Failed to update license status on subscription deletion: ${error.message}`);
         else console.log(`Subscription license marked cancelled for sub ID: ${subscription.id}`);
        break;
      }

      // --- Add handlers for other relevant events ---
      // e.g., 'customer.subscription.trial_will_end'

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 OK response to Stripe
    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
      console.error('Error processing webhook event:', event.type, error.message);
      // Return 500 to signal an internal error, Stripe will retry (configure retries in Stripe dashboard)
      return new Response(`Webhook handler failed: ${error.message}`, { status: 500 });
  }
})

/*
Usage Notes:
1. Deploy this function to Supabase Edge Functions (`supabase functions deploy stripe-webhooks --no-verify-jwt`). JWT verification is not needed as Stripe uses signature verification.
2. Configure the webhook endpoint in your Stripe dashboard to point to this function's URL.
3. Select the specific events you want Stripe to send (e.g., `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, etc.).
4. Ensure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are correctly set in Supabase Function secrets.
5. Add metadata (`tenant_id`, `license_type`, `project_id` if needed) when creating Stripe Checkout Sessions.
6. Add metadata (`max_users`) to your Stripe Products/Prices if managing tiers.
*/
