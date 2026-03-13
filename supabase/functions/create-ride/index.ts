
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- CENTRALIZED PRICING LOGIC ---
const PRICING_RULES = {
    BASE_FARE: 20,
    PER_KM: 10,
    PER_STOP: 25,
    WINDOWS: {
        MORNING: { start: 6, end: 19, multiplier: 1.0, base: 60 },
        EVENING: { start: 20, end: 23, multiplier: 1.2, base: 80 },
        NIGHT: { start: 0, end: 5, multiplier: 1.5, base: 100 }
    },
    VEHICLES: {
        'RideLite': 1.0,
        'RideComfort': 1.3,
        'RideXL': 1.6,
        'Motorbike': 0.8,
        'Bakkie': 2.0
    }
};

function calculatePrice(distanceKm: number, vehicleType: string, stopsCount: number): number {
    const hour = new Date().getHours(); // Server time (UTC usually, ensure offset for SAST +2)
    const saHour = (hour + 2) % 24;

    let window = PRICING_RULES.WINDOWS.MORNING;
    if (saHour >= PRICING_RULES.WINDOWS.EVENING.start && saHour <= PRICING_RULES.WINDOWS.EVENING.end) window = PRICING_RULES.WINDOWS.EVENING;
    if (saHour >= PRICING_RULES.WINDOWS.NIGHT.start && saHour <= PRICING_RULES.WINDOWS.NIGHT.end) window = PRICING_RULES.WINDOWS.NIGHT;

    let total = window.base + (distanceKm * PRICING_RULES.PER_KM) + (stopsCount * PRICING_RULES.PER_STOP);
    
    // Apply Vehicle Multiplier
    const vMult = PRICING_RULES.VEHICLES[vehicleType] || 1.0;
    total = total * vMult * window.multiplier;

    return Math.ceil(total);
}

// --- GOOGLE MAPS DISTANCE HELPER ---
async function getGoogleDistance(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}, waypoints: any[] = []): Promise<number> {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
        console.warn("Missing GOOGLE_MAPS_API_KEY, falling back to mock distance");
        return 5 + (waypoints?.length || 0) * 3;
    }

    try {
        const originStr = `${origin.lat},${origin.lng}`;
        const destStr = `${destination.lat},${destination.lng}`;
        const waypointsStr = waypoints.length > 0 
            ? `&waypoints=${waypoints.map(w => `${w.lat},${w.lng}`).join('|')}`
            : '';

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}${waypointsStr}&key=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Maps API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }

        let totalMeters = 0;
        data.routes[0].legs.forEach((leg: any) => {
            totalMeters += leg.distance.value;
        });

        return totalMeters / 1000; // Convert to KM
    } catch (e) {
        console.error("Distance Calculation Failed:", e);
        return 5 + (waypoints?.length || 0) * 3; // Fallback
    }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, pickup, dropoff, waypoints, paymentMethod, vehicleType } = await req.json()
    
    // 1. Calculate Price Securely using REAL distance
    const distanceKm = await getGoogleDistance(pickup, dropoff, waypoints);
    const finalPrice = calculatePrice(distanceKm, vehicleType, waypoints?.length || 0);

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        rider_id: user.id,
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        // Store waypoints as JSONB if column exists, or rely on client state for now if not in schema.
        // Assuming schema might need update or we just calculate price here. 
        // For this implementation, we focus on price correctness.
        price: finalPrice, 
        payment_method: paymentMethod,
        type: type,
        status: 'SEARCHING',
        location: `POINT(${pickup.lng} ${pickup.lat})`
      })
      .select()
      .single()

    if (error) throw error

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
