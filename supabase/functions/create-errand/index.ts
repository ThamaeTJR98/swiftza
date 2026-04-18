
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICING = {
    BASE: 45,
    PER_KM: 8.5,
    PER_STOP: 30,
    QUEUE_RATE_PER_HOUR: 120
};

// --- GOOGLE MAPS DISTANCE HELPER ---
async function getGoogleDistance(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}, stops: any[] = []): Promise<number> {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
        console.warn("Missing GOOGLE_MAPS_API_KEY, falling back to mock distance");
        return 5;
    }

    try {
        const originStr = `${origin.lat},${origin.lng}`;
        const destStr = `${destination.lat},${destination.lng}`;
        const waypointsStr = stops.length > 0 
            ? `&waypoints=${stops.map(w => `${w.lat},${w.lng}`).join('|')}`
            : '';

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}${waypointsStr}&key=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Maps API Error: ${data.status}`);
        }

        let totalMeters = 0;
        data.routes[0].legs.forEach((leg: any) => {
            totalMeters += leg.distance.value;
        });

        return totalMeters / 1000; // Convert to KM
    } catch (e) {
        console.error("Distance Calculation Failed:", e);
        return 5; // Fallback
    }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { pickup, dropoff, stops, errandDetails, paymentMethod } = await req.json()
    
    // 1. Calculate Errand Price using REAL distance
    const stopsCount = stops?.length || 0;
    const distanceKm = await getGoogleDistance(pickup, dropoff, stops);
    
    let price = PRICING.BASE + (distanceKm * PRICING.PER_KM) + (stopsCount * PRICING.PER_STOP);
    
    if (errandDetails?.category === 'GOVT_QUEUE' || errandDetails?.category === 'BANK_QUEUE') {
        price += (PRICING.QUEUE_RATE_PER_HOUR / 2); // Add 30 mins base queue fee
    }

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // --- SUBSCRIPTION CHECK ---
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, errand_credits_remaining')
        .eq('id', user.id)
        .single();

    let finalPrice = Math.ceil(price);
    let usedCredit = false;

    if (profile?.subscription_tier === 'CREATOR_6' && profile.errand_credits_remaining > 0) {
        // Check if it's daytime (e.g., 7 AM to 5 PM SAST)
        const currentHour = new Date().getUTCHours() + 2; // Rough SAST conversion
        if (currentHour >= 7 && currentHour <= 17) {
            // Check distance cap (e.g., 15km)
            if (distanceKm <= 15) {
                finalPrice = 0;
                usedCredit = true;
            } else {
                // Charge only for the overage distance
                finalPrice = Math.ceil((distanceKm - 15) * PRICING.PER_KM);
                usedCredit = true;
            }
        }
    }

    const { data: errand, error } = await supabase
      .from('rides')
      .insert({
        rider_id: user.id,
        type: 'errand',
        status: 'SEARCHING',
        price: finalPrice,
        payment_method: usedCredit ? 'SUBSCRIPTION' : paymentMethod,
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        stops: stops,
        errand_details: errandDetails,
        otp: Math.floor(1000 + Math.random() * 9000).toString()
      })
      .select()
      .single()

    if (error) throw error

    // Deduct credit if used
    if (usedCredit) {
        await supabase
            .from('profiles')
            .update({ errand_credits_remaining: profile.errand_credits_remaining - 1 })
            .eq('id', user.id);
    }

    return new Response(JSON.stringify(errand), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
