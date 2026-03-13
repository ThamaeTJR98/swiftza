import { supabase } from '../lib/supabase';
import { Incident, Location } from '../types';

export const SafetyService = {
  /**
   * Triggers a Panic Alert.
   * Logs the incident to the database and notifies emergency contacts.
   */
  triggerPanic: async (userId: string, rideId: string | undefined, location: Location) => {
    try {
      // 1. Log Incident to Database (Immutable record)
      const { data: incident, error } = await supabase
        .from('incidents')
        .insert({
          reporter_id: userId,
          ride_id: rideId,
          type: 'PANIC',
          lat: location.lat,
          lng: location.lng,
          description: 'User triggered panic button during trip.',
          resolved: false
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Notify Emergency Contacts (Simulated via Edge Function)
      // In production, this would send SMS/Push to contacts
      await supabase.functions.invoke('notify-emergency', {
        body: { incidentId: incident.id, userId, location }
      });

      return incident;
    } catch (e) {
      console.error("[SafetyService] Panic trigger failed:", e);
      throw e;
    }
  },

  /**
   * Generates a WhatsApp sharing link for trip tracking.
   * Extremely popular safety feature in South Africa.
   */
  getShareLink: (rideId: string, riderName: string, destination: string) => {
    const baseUrl = window.location.origin;
    const trackingUrl = `${baseUrl}/track/${rideId}`;
    const message = `Hey, I'm taking a trip with SwiftZA to ${destination}. You can track my ride here: ${trackingUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
};
