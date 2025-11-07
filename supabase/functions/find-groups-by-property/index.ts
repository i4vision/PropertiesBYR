// Fix: Add a minimal type declaration for the Deno global to resolve type errors.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// This function is triggered by an HTTP POST request.
serve(async (req) => {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Ensure the request is a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed', status: 405 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Parse the request body to get the property name
    const { propertyName } = await req.json();
    if (!propertyName) {
      return new Response(JSON.stringify({ error: 'propertyName is required', status: 400 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key to bypass RLS for this server-side operation.
    // These environment variables must be set in your Supabase project's Function settings.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Find the property by name
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name')
      .ilike('name', propertyName) // Case-insensitive search
      .single();

    if (propertyError) {
      // If the error is because no rows were found, return a 404
      if (propertyError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Property not found', status: 404 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      // For other database errors, throw them to be caught by the catch block
      throw propertyError;
    }
    
    // 2. Fetch the WhatsApp groups associated with the found property
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('whatsapp_groups')
      .select('id, name, template, links')
      .eq('property_id', property.id);

    if (groupsError) {
      throw groupsError;
    }

    // Return the successful response
    const responseData = {
        propertyName: property.name,
        groups: groups || [],
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Generic error handler for any other issues
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred', status: 500 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});