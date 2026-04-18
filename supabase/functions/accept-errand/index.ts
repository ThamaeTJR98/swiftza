
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

    // 1. Compliance Check
    const { data: driver, error: driverError } = await supabase
      .from('profiles')
      .select('compliance_status, kyc_status, role')
      .eq('id', driverId)
      .single()

    if (driverError || !driver) throw new Error("Driver profile not found.");
    if (driver.role !== 'DRIVER') throw new Error("Only drivers can accept errands.");
    if (driver.compliance_status !== 'APPROVED' || driver.kyc_status !== 'APPROVED') {
      throw new Error("Compliance Lock: Your account is not fully verified.");
    }

    // 2. Atomic Update (Optimistic Lock)
    const { data: errand, error } = await supabase
      .from('rides')
      .update({ driver_id: driverId, status: 'ACCEPTED' })
      .eq('id', rideId)
      .eq('status', 'SEARCHING')
      .eq('type', 'errand')
      .select('*, rider:rider_id(fcm_token)')
      .single()

    if (error || !errand) throw new Error("Errand not available or already taken.");

    // 3. Notify Rider
    const riderToken = errand.rider?.fcm_token;
    if (riderToken) {
        await supabase.functions.invoke('send-push-notification', {
            body: {
                userId: errand.rider_id,
                title: "Runner Found!",
                message: "A runner has accepted your errand and is on the way."
            }
        });
    }

    return new Response(JSON.stringify(errand), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
