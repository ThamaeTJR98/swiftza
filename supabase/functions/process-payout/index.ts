
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

    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackKey) throw new Error("Missing PAYSTACK_SECRET_KEY");

    // 1. Verify Admin (Only admins can process payouts)
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'ADMIN') throw new Error('Only admins can process payouts')

    // 2. Fetch Drivers with Balance > 0
    const { data: drivers, error: driverError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'DRIVER')
        .gt('wallet_balance', 0);

    if (driverError) throw driverError;
    if (!drivers || drivers.length === 0) return new Response(JSON.stringify({ message: "No drivers to payout" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const results = [];

    for (const driver of drivers) {
        try {
            // 3. Create Transfer Recipient (Mocked or real Paystack call)
            // In production, we'd check if they already have a recipient_code
            const bankingData = driver.banking_data || {};
            if (!bankingData.account_number || !bankingData.bank_code) {
                results.push({ driverId: driver.id, status: 'FAILED', reason: 'Missing banking data' });
                continue;
            }

            // 4. Initiate Paystack Transfer
            const amountInCents = Math.floor(driver.wallet_balance * 100);
            
            // This is a simplified version. In production, you'd handle recipient creation separately.
            const transferResp = await fetch('https://api.paystack.co/transfer', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${paystackKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source: "balance",
                    amount: amountInCents,
                    recipient: bankingData.recipient_code, // Assuming we stored this during onboarding
                    reason: "Weekly Driver Payout - SwiftZA"
                })
            });

            const transferData = await transferResp.json();

            if (transferData.status) {
                // 5. Update Wallet & Ledger
                await supabase.from('ledger').insert({
                    profile_id: driver.id,
                    amount: -driver.wallet_balance,
                    type: 'PAYOUT',
                    description: `Payout processed: ${transferData.data.transfer_code}`
                });

                await supabase
                    .from('profiles')
                    .update({ wallet_balance: 0 })
                    .eq('id', driver.id);

                results.push({ driverId: driver.id, status: 'SUCCESS', transferCode: transferData.data.transfer_code });
            } else {
                results.push({ driverId: driver.id, status: 'FAILED', reason: transferData.message });
            }

        } catch (e: any) {
            results.push({ driverId: driver.id, status: 'ERROR', reason: e.message });
        }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})
