import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

// SETUP:
// supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxx

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, amount, rideId, provider } = await req.json()
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')

    if (!paystackKey) {
        throw new Error("Missing Server Configuration (PAYSTACK_SECRET_KEY)");
    }

    if (provider === 'PAYSTACK') {
        // PayStack API Call
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystackKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                amount: amount * 100, // Convert ZAR to cents
                currency: 'ZAR',
                reference: `ridesa_${rideId}_${Date.now()}`,
                metadata: {
                    ride_id: rideId,
                    custom_fields: [
                        { display_name: "Ride ID", variable_name: "ride_id", value: rideId }
                    ]
                },
                // Add split code here if implementing marketplace logic immediately
                // split_code: "SPL_xxxxxxxx" 
            })
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error("PayStack Error: " + data.message);
        }

        return new Response(
            JSON.stringify(data.data),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }

    throw new Error("Unsupported Provider");

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})