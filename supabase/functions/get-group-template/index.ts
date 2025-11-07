// Fix: Add a minimal type declaration for the Deno global to resolve type errors.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

    // Parse the request body to get the property and group names
    const { propertyName, groupName } = await req.json();
    if (!propertyName || !groupName) {
      return new Response(JSON.stringify({ error: 'propertyName and groupName are required', status: 400 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Find the property by name to get its ID
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name')
      .ilike('name', propertyName)
      .single();

    if (propertyError) {
      if (propertyError.code === 'PGRST116') { // "PGRST116" means "JSON object requested, but row not found"
        return new Response(JSON.stringify({ error: 'Property not found', status: 404 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      throw propertyError;
    }
    
    // 2. Find the group by name within that property
    const { data: group, error: groupError } = await supabaseAdmin
      .from('whatsapp_groups')
      .select('name, template')
      .eq('property_id', property.id)
      .ilike('name', groupName)
      .single();

    if (groupError) {
       if (groupError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Group not found in this property', status: 404 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      throw groupError;
    }

    // Return the successful response with the template
    const responseData = {
        propertyName: property.name,
        groupName: group.name,
        template: group.template,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Generic error handler
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred', status: 500 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});