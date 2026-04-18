
import { supabase } from '../lib/supabase';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// In a full production app, you would also import a Background Geolocation plugin here
// import { BackgroundGeolocation } from '@capawesome/capacitor-background-geolocation';

export const LocationService = {
    
    watchId: null as string | number | null,

    startTracking: async (driverId: string) => {
        try {
            console.log(`[LocationService] Starting tracking for ${driverId}`);
            
            // WEB PLATFORM FALLBACK
            // The Capacitor Geolocation plugin often throws "Not implemented on web" for permissions check 
            // or specific native features. We use standard browser API for web.
            if (!Capacitor.isNativePlatform()) {
                if ('geolocation' in navigator) {
                    LocationService.watchId = navigator.geolocation.watchPosition(
                        (position) => {
                            syncLocationToDB(
                                driverId,
                                position.coords.latitude,
                                position.coords.longitude
                            );
                        },
                        (err) => console.error("Web Geolocation Error:", err),
                        { enableHighAccuracy: true }
                    );
                    return;
                } else {
                    console.warn("Geolocation not supported on this browser.");
                    return;
                }
            }

            // NATIVE PLATFORM (iOS/Android)
            // 1. Check Permissions
            try {
                const permissions = await Geolocation.checkPermissions();
                if (permissions.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') throw new Error("Location permission denied");
                }
            } catch (permError) {
                console.warn("[LocationService] Permission check failed (likely web environment):", permError);
                // If permission check fails, we might still be able to use the watch, 
                // but usually this means we should have used the web fallback above.
            }

            // 2. Clear existing watch if any
            if (LocationService.watchId) {
                await Geolocation.clearWatch({ id: LocationService.watchId as string });
            }

            // 3. Start Watch
            const watchId = await Geolocation.watchPosition(
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                },
                (position, err) => {
                    if (err) {
                        console.error("[LocationService] Error:", err);
                        return;
                    }
                    if (position) {
                        syncLocationToDB(
                            driverId, 
                            position.coords.latitude, 
                            position.coords.longitude
                        );
                    }
                }
            );
            LocationService.watchId = watchId;

        } catch (e) {
            console.error("[LocationService] Failed to start tracking:", e);
        }
    },

    /**
     * Identifies the South African province based on coordinates.
     * Used for enforcing geo-jurisdiction rules.
     */
    getProvince: (lat: number, lng: number): string => {
        // Simplified bounding boxes for major SA provinces
        // Gauteng
        if (lat >= -26.9 && lat <= -25.0 && lng >= 27.2 && lng <= 29.0) return 'Gauteng';
        // Western Cape
        if (lat >= -34.9 && lat <= -30.5 && lng >= 17.5 && lng <= 24.0) return 'Western Cape';
        // KwaZulu-Natal
        if (lat >= -31.1 && lat <= -26.8 && lng >= 28.8 && lng <= 33.0) return 'KwaZulu-Natal';
        
        return 'Other';
    },

    stopTracking: async () => {
        if (LocationService.watchId) {
            console.log("[LocationService] Stopping tracking");
            
            if (!Capacitor.isNativePlatform()) {
                navigator.geolocation.clearWatch(LocationService.watchId as number);
            } else {
                await Geolocation.clearWatch({ id: LocationService.watchId as string });
            }
            
            LocationService.watchId = null;
        }
    }
};

async function syncLocationToDB(driverId: string, lat: number, lng: number) {
    // Skip sync for mock users to avoid DB errors (UUID constraint)
    if (driverId.startsWith('mock_')) {
        return;
    }

    // Debounce or throttle this in production to save battery/data
    try {
        const { error } = await supabase
            .from('driver_locations')
            .upsert({
                driver_id: driverId,
                lat,
                lng,
                // PostGIS point format: POINT(lng lat)
                location: `POINT(${lng} ${lat})`, 
                last_updated: new Date().toISOString()
            });

        if (error) console.error("[LocationService] DB Sync Error:", error.message);
    } catch (e) {
        console.error("[LocationService] Sync Exception:", e);
    }
}
