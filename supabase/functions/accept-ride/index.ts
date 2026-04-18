import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

// --- SETUP ---
// You need to set FCM_SERVER_KEY in your Supabase Secrets
// supabase secrets set FCM_SERVER_KEY=your_firebase_server_key

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { rideId, driverId } = await req.json()

    // 0. COMPLIANCE CHECK (SA Regulatory Requirement)
    const { data: driver, error: driverError } = await supabase
      .from('profiles')
      .select('compliance_status, prdp_expiry, kyc_status')
      .eq('id', driverId)
      .single()

    if (driverError || !driver) {
      throw new Error("Driver profile not found.");
    }

    const isCompliant = (driver.compliance_status === 'APPROVED' || driver.compliance_status === 'EXPIRING_SOON') && 
                        driver.kyc_status === 'APPROVED';

    if (!isCompliant) {
      throw new Error("Compliance Lock: Your account is suspended or documents have expired.");
    }

    // 1. ATOMIC UPDATE (The Race Condition Fix)
    // We try to update the ride ONLY if status is still 'SEARCHING'
    // This ensures that if 2 drivers click at same time, only the first DB hit succeeds.
    const { data: ride, error, count } = await supabase
      .from('rides')
      .update({ 
        driver_id: driverId,
        status: 'ACCEPTED'
      })
      .eq('id', rideId)
      .eq('status', 'SEARCHING') // Critical: optimistic lock
      .select('*, rider:rider_id(fcm_token)') // Get Rider Token for notification
      .single()

    if (error || !ride) {
      throw new Error("Ride not available or already taken.");
    }

    // 2. NOTIFY RIDER
    const riderToken = ride.rider?.fcm_token;
    if (riderToken) {
        await sendPushNotification(
            riderToken, 
            "Driver Found!", 
            "A driver has accepted your request and is on the way."
        );
    }

    return new Response(
      JSON.stringify(ride),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})

// Helper to send FCM (Firebase Cloud Messaging)
async function sendPushNotification(token: string, title: string, body: string) {
    const fcmKey = Deno.env.get('FCM_SERVER_KEY');
    if(!fcmKey) {
        console.log("FCM_SERVER_KEY not set, skipping push.");
        return;
    }

    await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmKey}`
        },
        body: JSON.stringify({
            to: token,
            notification: { title, body },
            data: { click_action: 'FLUTTER_NOTIFICATION_CLICK' }
        })
    });
}