
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    const { rideId, reason } = await req.json()
    
    // 1. Verify Authorization
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Get Ride Details
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .single()

    if (rideError || !ride) throw new Error('Ride not found')

    // 3. Check if user is part of the ride
    if (ride.rider_id !== user.id && ride.driver_id !== user.id) {
        throw new Error('You are not authorized to cancel this job')
    }

    // 4. Cancellation Logic (Fees, etc.)
    let cancellationFee = 0;
    if (ride.status === 'IN_PROGRESS' || ride.status === 'ARRIVED_PICKUP') {
        cancellationFee = 25; // R25 cancellation fee if driver is already there or job started
    }

    // 5. Update Ride Status
    const { error: updateError } = await supabase
      .from('rides')
      .update({ 
          status: 'CANCELLED',
          cancel_reason: reason,
          cancelled_by: user.id,
          cancellation_fee: cancellationFee
      })
      .eq('id', rideId);

    if (updateError) throw updateError;

    // 6. Handle Fee (Debit rider, credit driver if applicable)
    if (cancellationFee > 0 && ride.driver_id) {
        // This would involve ledger entries in a real system
        await supabase.from('ledger').insert([
            {
                profile_id: ride.rider_id,
                ride_id: rideId,
                amount: -cancellationFee,
                type: 'CANCELLATION_FEE',
                description: `Cancellation fee for ride ${rideId}`
            },
            {
                profile_id: ride.driver_id,
                ride_id: rideId,
                amount: cancellationFee * 0.8, // Driver gets 80% of fee
                type: 'CANCELLATION_EARNING',
                description: `Cancellation earning for ride ${rideId}`
            }
        ]);
    }

    // 7. Notify other party (Mock)
    console.log(`Job ${rideId} cancelled by ${user.id}. Reason: ${reason}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Job cancelled successfully', fee: cancellationFee }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
