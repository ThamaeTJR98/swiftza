
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. SECURITY: Verify Signature
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    const signature = req.headers.get('x-paystack-signature');
    const bodyText = await req.text();

    if (!secret || !signature) throw new Error("Missing secret or signature");

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const bodyData = encoder.encode(bodyText);

    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-512" }, false, ["verify"]
    );

    // Convert hex signature to buffer
    const signatureBytes = new Uint8Array(signature.match(/[\da-f]{2}/gi)!.map((h:any) => parseInt(h, 16)));
    
    const isValid = await crypto.subtle.verify(
      "HMAC", key, signatureBytes, bodyData
    );

    if (!isValid) {
        console.error("Invalid Webhook Signature");
        return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(bodyText);

    // 2. Handle 'charge.success'
    if (event.event === 'charge.success') {
        const metadata = event.data.metadata;
        const rideId = metadata.ride_id;
        
        console.log(`Verified Payment for Ride ${rideId}`);

        if (rideId) {
            await supabase
                .from('rides')
                .update({ status: 'SEARCHING', payment_status: 'PAID' })
                .eq('id', rideId);
        }
    }

    return new Response("Webhook Received", { status: 200 });

  } catch (error: any) {
    console.error(error);
    return new Response("Error", { status: 400 });
  }
})
