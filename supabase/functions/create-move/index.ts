
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MOVE_PRICING = {
    BAKKIE: { base: 350, perKm: 15 },
    TRUCK: { base: 850, perKm: 25 },
    HELPER_RATE: 150
};

// --- GOOGLE MAPS DISTANCE HELPER ---
async function getGoogleDistance(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}): Promise<number> {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
        console.warn("Missing GOOGLE_MAPS_API_KEY, falling back to mock distance");
        return 10;
    }

    try {
        const originStr = `${origin.lat},${origin.lng}`;
        const destStr = `${destination.lat},${destination.lng}`;

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;
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
        return 10; // Fallback
    }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { pickup, dropoff, vehicleType, helpersCount, paymentMethod } = await req.json()
    
    // 1. Calculate Move Price using REAL distance
    const config = vehicleType === 'Truck' ? MOVE_PRICING.TRUCK : MOVE_PRICING.BAKKIE;
    const distanceKm = await getGoogleDistance(pickup, dropoff);
    
    const price = config.base + (distanceKm * config.perKm) + (helpersCount * MOVE_PRICING.HELPER_RATE);

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // --- POSTGIS DISPATCH ---
    // Find the closest driver with the requested vehicle type (Bakkie or Truck) within 15km
    const { data: nearbyDrivers, error: rpcError } = await supabase.rpc('find_nearby_drivers', {
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        search_radius_meters: 15000, // 15km radius for moves
        required_vehicle_type: vehicleType
    });

    if (rpcError) {
        console.error("PostGIS Dispatch Error:", rpcError);
    }

    // If we found a driver, assign them immediately (in a real app, you'd use a cascade/queue)
    const assignedDriverId = nearbyDrivers && nearbyDrivers.length > 0 ? nearbyDrivers[0].driver_id : null;
    const initialStatus = assignedDriverId ? 'DRIVER_ASSIGNED' : 'SEARCHING';

    const { data: move, error } = await supabase
      .from('rides')
      .insert({
        rider_id: user.id,
        driver_id: assignedDriverId, // Assign the closest driver if found
        type: 'move',
        status: initialStatus,
        price: Math.ceil(price),
        payment_method: paymentMethod,
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        errand_details: { vehicleType, helpersCount },
        otp: Math.floor(1000 + Math.random() * 9000).toString()
      })
      .select()
      .single()

    if (error) throw error

    // --- PUSH NOTIFICATION (OneSignal) ---
    if (assignedDriverId) {
        // In a production app, you would trigger a webhook or call OneSignal API here
        // to wake up the driver's phone: "New Move Request: R850"
        console.log(`[Dispatch] Assigned Move ${move.id} to Driver ${assignedDriverId}`);
    }

    return new Response(JSON.stringify(move), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 })
  }
})
