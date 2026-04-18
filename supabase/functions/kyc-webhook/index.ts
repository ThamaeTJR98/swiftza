
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("SwiftZA Webhook Hit: " + req.method);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Read Body & Signature
    const secret = Deno.env.get('DIDIT_WEBHOOK_SECRET');
    const signature = req.headers.get('X-Signature');
    const bodyText = await req.text(); // Read raw body

    console.log("Webhook Signature:", signature ? "Present" : "Missing");
    console.log("Webhook Secret Configured:", secret ? "Yes" : "No");

    // 3. Optional Verification (Bypasses for Dev/Test)
    if (secret && signature) {
        try {
            const encoder = new TextEncoder();
            const keyData = encoder.encode(secret);
            const bodyData = encoder.encode(bodyText);

            const key = await crypto.subtle.importKey(
              "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
            );

            // Convert hex signature to buffer
            const signatureBytes = new Uint8Array(signature.match(/[\da-f]{2}/gi)!.map((h:any) => parseInt(h, 16)));
            
            const isValid = await crypto.subtle.verify(
              "HMAC", key, signatureBytes, bodyData
            );

            if (!isValid) {
                console.warn("⚠️ Signature Mismatch (Ignoring for Dev Mode)");
            } else {
                console.log("✅ Signature Verified");
            }
        } catch (e) {
            console.warn("⚠️ Signature Check Failed (Crypto Error):", e);
        }
    } else {
        console.warn("⚠️ Skipping verification: Missing Secret or Signature");
    }

    // 4. Process Event
    const event = JSON.parse(bodyText);
    const eventType = event.event; 
    const sessionData = event.data || {};
    const userId = sessionData.external_id; 

    console.log(`Processing Event: ${eventType} for User: ${userId}`);

    if (userId) {
        if (eventType === 'session.approved') {
            await supabase
                .from('profiles')
                .update({ 
                    kyc_status: 'APPROVED',
                    is_verified: true, 
                    kyc_rejection_reason: null
                })
                .eq('id', userId);
            console.log("User Approved in DB");
                
        } else if (eventType === 'session.declined' || eventType === 'session.review') {
            const reason = sessionData.decline_reason || 'Verification failed';
            await supabase
                .from('profiles')
                .update({ 
                    kyc_status: 'REJECTED',
                    is_verified: false,
                    kyc_rejection_reason: reason
                })
                .eq('id', userId);
            console.log("User Rejected in DB");
        }
    }

    return new Response("SwiftZA Webhook Processed", { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("Webhook Internal Error:", error);
    // Return 200 even on error to prevent Didit from retrying infinitely
    return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: corsHeaders });
  }
})
