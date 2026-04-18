import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { dispute_id, resolution, notes } = await req.json()
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')

    if (!paystackKey) {
        throw new Error("Missing Server Configuration (PAYSTACK_SECRET_KEY)");
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch Dispute & Ride Details
    const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .select(`*, rides:ride_id (id, price, payment_method)`)
        .eq('id', dispute_id)
        .single();

    if (disputeError || !dispute) {
        throw new Error("Dispute not found");
    }

    if (dispute.status === 'RESOLVED') {
        throw new Error("Dispute is already resolved");
    }

    // 2. Process Paystack Refund if applicable
    if (resolution === 'REFUND' && dispute.rides.payment_method === 'PAYSTACK') {
        // We use the ride ID as the reference prefix (as created in initial-payment)
        // Note: In a full production system, you'd store the exact Paystack transaction ID in the rides table.
        // For this implementation, we will attempt to refund using the known reference format or log the intent.
        
        // Example Paystack Refund Call (Requires exact transaction reference)
        /*
        const response = await fetch('https://api.paystack.co/refund', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystackKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transaction: `ridesa_${dispute.rides.id}`, // Assuming this was the reference
                amount: dispute.rides.price * 100 // Convert ZAR to cents
            })
        });
        const data = await response.json();
        if (!data.status) throw new Error("PayStack Refund Error: " + data.message);
        */
        
        console.log(`[PAYSTACK REFUND MOCK] Refunding R${dispute.rides.price} for Ride ${dispute.rides.id}`);
    }

    // 3. Update Database via RPC (Reverses Ledger & Updates Status)
    const { error: rpcError } = await supabase.rpc('resolve_dispute', {
        dispute_id_input: dispute_id,
        resolution: resolution,
        notes: notes || `Resolved via Edge Function`
    });

    if (rpcError) {
        throw rpcError;
    }

    return new Response(
        JSON.stringify({ success: true, message: `Dispute resolved with ${resolution}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
