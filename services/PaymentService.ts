
import { supabase } from "../lib/supabase";

export const PaymentService = {
    async initializeTransaction(email: string, amount: number, rideId: string) {
        // Use Supabase Edge Function for production-ready payments
        const { data, error } = await supabase.functions.invoke('initial-payment', {
            body: { email, amount, rideId, provider: 'PAYSTACK' }
        });
        
        if (error) {
            console.error("Payment Init Error:", error);
            throw new Error(error.message || 'Failed to initialize payment');
        }
        
        return data;
    },

    async verifyTransaction(reference: string) {
        // Verification is usually handled by the webhook, but we can check status if needed
        const { data, error } = await supabase
            .from('rides')
            .select('payment_status, price')
            .eq('id', reference.split('_')[1]) // Assuming reference format ridesa_ID_timestamp
            .single();
            
        if (error) throw error;
        return { 
            status: data.payment_status === 'PAID',
            amount: data.price
        };
    }
};
