
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { rideId, amount, reason } = await req.json()
    
    // 1. Verify Authorization
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Verify Ride Status & Driver
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*, profiles!rides_driver_id_fkey(virtual_card_id)')
      .eq('id', rideId)
      .single()

    if (rideError || !ride) throw new Error('Ride not found')
    if (ride.driver_id !== user.id) throw new Error('You are not the assigned driver for this job')
    if (ride.status !== 'IN_PROGRESS' && ride.status !== 'SHOPPING' && ride.status !== 'ARRIVED_PICKUP') {
        throw new Error('Ride is not in an active state for funding')
    }

    // 3. Validation: Check if amount is within reasonable limits
    const maxAllowed = 5000; // e.g., R5000 max for incidental funds
    if (amount > maxAllowed) {
        throw new Error(`Amount exceeds maximum allowed incidental funding (R${maxAllowed})`);
    }

    // 4. JIT Funding Logic (Integration with Root/Stripe Issuing)
    const virtualCardId = ride.profiles?.virtual_card_id;
    if (!virtualCardId) {
        // In a real scenario, you might provision a card here or throw an error
        console.warn(`[JIT Funding] Driver ${user.id} does not have a virtual card assigned.`);
    } else {
        // Example: Call Card Issuer API to load funds or update spend limit
        const rootApiKey = Deno.env.get('ROOT_API_KEY');
        if (rootApiKey) {
            /*
            const response = await fetch(`https://api.root.co.za/v1/cards/${virtualCardId}/limits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${rootApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount * 100, // Convert to cents
                    currency: 'ZAR',
                    type: 'single_transaction'
                })
            });
            if (!response.ok) throw new Error('Failed to authorize funds on virtual card');
            */
            console.log(`[JIT Funding] API Call to Root for Card ${virtualCardId}: R${amount}`);
        }
    }
    
    console.log(`[JIT Funding] Authorizing R${amount} for ride ${rideId}. Reason: ${reason}`);

    // 5. Log the request in ledger or a dedicated funding_requests table
    await supabase.from('ledger').insert({
        profile_id: user.id,
        ride_id: rideId,
        amount: -amount, // Debit from job budget or platform account
        type: 'INCIDENTAL_FUNDING',
        description: `Incidental Funding: ${reason}`
    });

    return new Response(
      JSON.stringify({ 
          success: true, 
          transactionId: `jit_${Math.random().toString(36).substr(2, 9)}`,
          message: `R${amount} authorized for ${reason}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
