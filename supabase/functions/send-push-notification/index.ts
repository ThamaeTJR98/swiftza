
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

    const { userId, title, message, data } = await req.json()
    
    // 1. Fetch User's FCM Token or OneSignal ID
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', userId)
        .single();

    if (profileError || !profile?.fcm_token) {
        throw new Error("User has no active push token");
    }

    // 2. Send via OneSignal
    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
        // Fallback to console log if not configured
        console.log(`[PUSH MOCK] To: ${userId}, Title: ${title}, Msg: ${message}`);
        return new Response(JSON.stringify({ success: true, mocked: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payload: any = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        data: data || {}
    };

    if (profile?.fcm_token) {
        payload.include_player_ids = [profile.fcm_token];
    } else {
        payload.include_external_user_ids = [userId];
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
