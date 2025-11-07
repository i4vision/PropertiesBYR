// This file defines the CORS headers for your Supabase Edge Functions.
// It allows your web application to make requests to the function from a different origin.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin. For production, you might want to restrict this to your app's domain.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
