import { supabase } from '../lib/supabase';
import { RideRequest, RideStatus } from '../types';
import { Config } from '../utils/config';
import { LocationService } from './LocationService';

export const RideService = {
    // 1. RIDER: Create a request
    async requestRide(request: any, riderId: string) {
        if (Config.USE_MOCKS) {
            // LOCAL FALLBACK FOR DEV
            const distanceEst = 5 + (request.waypoints?.length || 0) * 2; 
            const basePrice = 20 + (distanceEst * 10);
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            return {
                id: 'local_' + Math.random().toString(36).substr(2, 9),
                rider_id: riderId,
                pickup_address: request.pickup.address,
                pickup_lat: request.pickup.lat,
                pickup_lng: request.pickup.lng,
                dropoff_address: request.dropoff.address,
                dropoff_lat: request.dropoff.lat,
                dropoff_lng: request.dropoff.lng,
                price: basePrice,
                payment_method: request.paymentMethod,
                type: request.type,
                status: 'SEARCHING',
                otp: otp,
                created_at: new Date().toISOString()
            };
        }

        try {
            let functionName = 'create-ride';
            if (request.type === 'errand') functionName = 'create-errand';
            if (request.type === 'move') functionName = 'create-move';

            const { data, error } = await supabase.functions.invoke(functionName, {
                body: {
                    type: request.type,
                    pickup: request.pickup,
                    dropoff: request.dropoff,
                    waypoints: request.waypoints,
                    stops: request.stops,
                    errandDetails: request.errandDetails,
                    paymentMethod: request.paymentMethod,
                    vehicleType: request.vehicleType || 'RideLite',
                    helpersCount: request.helpersCount
                }
            });

            if (error) throw error;
            if (!data) throw new Error("No data returned from pricing server");
            return data;
        } catch (err: any) {
            console.error("[RideService] Request Failed:", err);
            throw err;
        }
    },

    // 2. SHARED: Subscribe to Ride Updates
    subscribeToRide(rideId: string, onUpdate: (ride: any) => void) {
        if (rideId.startsWith('local_') || rideId.startsWith('mock_')) return { unsubscribe: () => {} };

        const channel = supabase
            .channel(`ride_${rideId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'rides',
                    filter: `id=eq.${rideId}`
                },
                (payload) => {
                    onUpdate(payload.new);
                }
            )
            .subscribe();

        return {
            unsubscribe: () => {
                supabase.removeChannel(channel);
            }
        };
    },

    // 3. DRIVER: Accept a ride
    async acceptRide(rideId: string, driverId: string, driverProvince: string | undefined, pickupLat: number, pickupLng: number, type: string = 'ride') {
        // CRITICAL: Geo-Jurisdiction Enforcement
        if (!Config.USE_MOCKS) {
             const rideProvince = LocationService.getProvince(pickupLat, pickupLng);
             if (driverProvince && rideProvince !== 'Other' && driverProvince !== rideProvince) {
                 throw new Error(`JURISDICTION VIOLATION: You are licensed in ${driverProvince} but this pickup is in ${rideProvince}.`);
             }
        }

        if (rideId.startsWith('local_') || rideId.startsWith('mock_')) {
            return { id: rideId, status: 'ACCEPTED', driver_id: driverId };
        }

        let functionName = 'accept-ride';
        if (type === 'errand') functionName = 'accept-errand';
        if (type === 'move') functionName = 'accept-move';

        // For 'ride' we use RPC for legacy support, but for new types we use Edge Functions
        if (type === 'ride') {
            const { data, error } = await supabase.rpc('accept_ride', {
                ride_id_input: rideId,
                driver_id_input: driverId
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            return data;
        } else {
            const { data, error } = await supabase.functions.invoke(functionName, {
                body: { rideId, driverId }
            });
            if (error) throw error;
            return data;
        }
    },

    // 4. SHARED: Update Status
    async updateStatus(rideId: string, status: RideStatus, extraData?: any) {
        if (rideId.startsWith('local_') || rideId.startsWith('mock_')) return;

        const updatePayload: any = { status, ...extraData };
        
        // Map camelCase to snake_case for DB
        if (extraData?.errandDetails) {
            updatePayload.errand_details = extraData.errandDetails;
            delete updatePayload.errandDetails;
        }

        const { error } = await supabase
            .from('rides')
            .update(updatePayload)
            .eq('id', rideId);
        
        if (error) throw error;
    },

    // 5. DRIVER: Complete Ride & Trigger Settle RPC
    async completeRide(rideId: string) {
        if (rideId.startsWith('local_') || rideId.startsWith('mock_')) return;

        // The RPC function 'complete_ride' handles:
        // - Updating status to COMPLETED
        // - Calculating 80/20 split
        // - Inserting ledger entries
        // - Updating driver's wallet balance
        const { error } = await supabase.rpc('complete_ride', {
            ride_id_input: rideId
        });

        if (error) {
            console.warn("[RideService] Settlement RPC failed, falling back to basic update:", error);
            await supabase.from('rides').update({ status: 'COMPLETED' }).eq('id', rideId);
        }
    },

    // 6. DRIVER: Request Incidental Funds (JIT Funding)
    async requestIncidentalFunds(rideId: string, amount: number, reason: string) {
        if (rideId.startsWith('local_') || rideId.startsWith('mock_')) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            return { success: true, transactionId: 'txn_' + Math.random().toString(36).substr(2, 9) };
        }

        // In production, this calls a secure Edge Function that:
        // 1. Verifies the driver is on an active job
        // 2. Checks if amount is within reasonable limits for the category
        // 3. Calls the Card Issuer API (Root/Stripe) to load funds
        const { data, error } = await supabase.functions.invoke('authorize-incidental-fund', {
            body: { rideId, amount, reason }
        });

        if (error) throw error;
        return data;
    }
};