// ** supabase/functions/_shared/cors.ts **
// Shared CORS headers configuration

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or restrict to your frontend domain: 'https://your-app.vercel.app'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE', // Add methods as needed
}
