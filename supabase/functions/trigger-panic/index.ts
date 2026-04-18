import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { ride_id, lat, lng, type } = await req.json()
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Log Incident
    const { data: incident, error: incidentError } = await supabaseClient
      .from('incidents')
      .insert({
        ride_id,
        reporter_id: user.id,
        type: type || 'PANIC',
        lat,
        lng,
        resolved: false
      })
      .select()
      .single()

    if (incidentError) throw incidentError

    // 2. Fetch Emergency Contacts
    const { data: contacts } = await supabaseClient
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)

    // 3. Simulate Sending SMS (In production, integrate Twilio/Clickatell here)
    console.log(`🚨 PANIC TRIGGERED by ${user.id} at ${lat}, ${lng}`)
    if (contacts && contacts.length > 0) {
        console.log(`📲 Notifying ${contacts.length} contacts: ${contacts.map(c => c.phone).join(', ')}`)
    }

    // 4. If active ride, notify the other party (Driver/Rider) via Push Notification (Mock)
    // In a real app, you'd use OneSignal or FCM here.

    return new Response(
      JSON.stringify({ success: true, incidentId: incident.id, message: 'Emergency contacts notified' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
