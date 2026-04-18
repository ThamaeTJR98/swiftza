
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// MOCK VIRTUAL CARD ISSUER (e.g., Stripe Issuing / Paystack Virtual Cards)
// In production, this would call the actual banking API
async function issueVirtualCard(driverId: string, amount: number, merchantCategory: string) {
    // 1. Call Banking API to create card
    // const card = await bankingApi.createCard({ ... })
    
    // MOCK RESPONSE
    return {
        pan: `5399${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        expiry: '12/28',
        id: crypto.randomUUID()
    };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { rideId, estimatedTotal } = await req.json()
    
    // 1. Verify Driver is at the Store (Geo-Fencing)
    // In a real app, we would query `driver_locations` and compare with `ride.pickup_lat/lng`
    // For now, we assume the client check passed.

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Calculate Buffer (15% for price variance)
    const bufferAmount = estimatedTotal * 1.15;

    // 3. Issue Virtual Card
    const cardDetails = await issueVirtualCard(user.id, bufferAmount, 'GROCERY');

    // 4. Save Encrypted Details to DB
    // In production, NEVER store raw PANs. Use a token or encrypt heavily.
    // Here we store it "encrypted" (mock) for the driver to see once.
    const { error: cardError } = await supabase
        .from('virtual_cards')
        .insert({
            driver_id: user.id,
            ride_id: rideId,
            card_pan_encrypted: cardDetails.pan, // Mock encryption
            card_cvv_encrypted: cardDetails.cvv,
            expiry_date: cardDetails.expiry,
            balance_limit: bufferAmount,
            status: 'ACTIVE',
            merchant_category_lock: 'GROCERY'
        });

    if (cardError) throw cardError;

    // 5. Update Ride Status to SHOPPING
    await supabase.from('rides').update({ status: 'SHOPPING' }).eq('id', rideId);

    return new Response(JSON.stringify({ 
        success: true, 
        card: cardDetails,
        limit: bufferAmount 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
