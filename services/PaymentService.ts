
import { supabase } from "../lib/supabase";

export const PaymentService = {
    async initializeTransaction(email: string, amount: number, rideId: string) {
        // FIX: was 'initial-payment' (typo) — correct name is 'initiate-payment'
        const { data, error } = await supabase.functions.invoke('initiate-payment', {
            body: { email, amount, rideId, provider: 'PAYSTACK' }
        });
        
        if (error) {
            console.error("Payment Init Error:", error);
            throw new Error(error.message || 'Failed to initialize payment');
        }
        
        return data;
    },

    /**
     * Verifies a Paystack transaction by calling the Paystack verify endpoint
     * via a Supabase edge function (to keep the secret key server-side).
     *
     * Handles two reference formats:
     *   - Ride payments:   ridesa_<rideId>_<timestamp>
     *   - Wallet top-ups:  wallet_<userId>_<timestamp>
     *
     * Returns { status: boolean, amount: number (in ZAR) }
     */
    async verifyTransaction(reference: string) {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { reference }
        });

        if (error) {
            console.error("Payment Verify Error:", error);
            throw new Error(error.message || 'Failed to verify payment');
        }

        return {
            status: data.status === true,
            amount: data.amount / 100, // Paystack returns amount in kobo/cents — convert to ZAR
            reference: data.reference,
            channel: data.channel,   // e.g. 'card', 'bank'
        };
    }
};
