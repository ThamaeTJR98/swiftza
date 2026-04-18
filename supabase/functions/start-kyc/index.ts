
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SwiftZA Specific Workflow IDs
const HARDCODED_RIDER_WORKFLOW = "cZ0iciXaTDuP0jLpcNwf4A";
const HARDCODED_DRIVER_WORKFLOW = "_-vTcV30RbCHODOA0iN9Ag";

// Your API Key (Included as fallback for easier deployment)
const FALLBACK_API_KEY = "dAaAY7AmIN6eF7FGSWI4-mESdsgz0FDu9wQqVXUuUg4";

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        throw new Error('Missing Authorization header');
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Determine Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || 'RIDER';

    // 3. Select Workflow
    const ENV_RIDER = Deno.env.get('DIDIT_WORKFLOW_ID_RIDER');
    const ENV_DRIVER = Deno.env.get('DIDIT_WORKFLOW_ID_DRIVER');

    let selectedWorkflowId = HARDCODED_RIDER_WORKFLOW;

    if (userRole === 'DRIVER') {
        selectedWorkflowId = ENV_DRIVER || HARDCODED_DRIVER_WORKFLOW;
    } else {
        selectedWorkflowId = ENV_RIDER || HARDCODED_RIDER_WORKFLOW;
    }

    // Use Environment Variable if set, otherwise use your provided key
    const DIDIT_API_KEY = Deno.env.get('DIDIT_API_KEY') || FALLBACK_API_KEY;
    
    // 4. Create Session
    // In production, this should be your hosted URL (e.g. Vercel or Netlify app URL)
    // For now, we use the app's deep link structure
    const returnUrl = "https://swiftza.app/profile"; 
    const BASE_URL = "https://verification.didit.me/v2";

    const payload = {
        workflow_id: selectedWorkflowId,
        external_id: user.id, 
        callback_url: returnUrl,
        vendor_data: "SwiftZA_Mobile_App",
        metadata: {
            email: user.email,
            role: userRole
        }
    };

    console.log(`Creating Didit session for ${userRole}...`);

    const response = await fetch(`${BASE_URL}/session/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIDIT_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Didit API Error:", errorText);
        throw new Error(`Provider Error: ${response.status} ${response.statusText}`);
    }

    const sessionData = await response.json();

    // 5. Save Session ID to Supabase
    await supabase
        .from('profiles')
        .update({ 
            kyc_session_id: sessionData.session_id,
            kyc_status: 'IN_PROGRESS' 
        })
        .eq('id', user.id);

    return new Response(
      JSON.stringify({ url: sessionData.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
