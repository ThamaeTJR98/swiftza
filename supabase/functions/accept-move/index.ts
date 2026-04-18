
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

    const { rideId, driverId } = await req.json()

    // 1. Compliance & Vehicle Check
    const { data: driver, error: driverError } = await supabase
      .from('profiles')
      .select('compliance_status, kyc_status, vehicle_type')
      .eq('id', driverId)
      .single()

    if (driverError || !driver) throw new Error("Driver profile not found.");
    if (driver.compliance_status !== 'APPROVED' || driver.kyc_status !== 'APPROVED') {
      throw new Error("Compliance Lock: Your account is not fully verified.");
    }

    // 2. Fetch Move Details
    const { data: move, error: moveError } = await supabase
      .from('rides')
      .select('errand_details')
      .eq('id', rideId)
      .single()

    if (moveError || !move) throw new Error("Move not found.");

    // 3. Match Vehicle (Simple check)
    if (move.errand_details?.vehicleType === 'Truck' && driver.vehicle_type !== 'Truck') {
        throw new Error("Vehicle Mismatch: This job requires a Truck.");
    }

    // 4. Atomic Update
    const { data: updatedMove, error } = await supabase
      .from('rides')
      .update({ driver_id: driverId, status: 'ACCEPTED' })
      .eq('id', rideId)
      .eq('status', 'SEARCHING')
      .eq('type', 'move')
      .select('*, rider:rider_id(fcm_token)')
      .single()

    if (error || !updatedMove) throw new Error("Move not available or already taken.");

    // 5. Notify Rider
    const riderToken = updatedMove.rider?.fcm_token;
    if (riderToken) {
        await supabase.functions.invoke('send-push-notification', {
            body: {
                userId: updatedMove.rider_id,
                title: "Mover Found!",
                message: "A mover has accepted your request and is on the way."
            }
        });
    }

    return new Response(JSON.stringify(updatedMove), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
