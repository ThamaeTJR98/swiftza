
import { supabase } from "../lib/supabase";

export const NotificationService = {
    async registerToken(token: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch('/api/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, token })
        });
        
        if (!response.ok) {
            console.error("Failed to register notification token");
        }
    },

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn("This browser does not support notifications.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log("Notification permission granted.");
            // In a real FCM setup, you would get the token here
            // const token = await getToken(messaging, { vapidKey: '...' });
            // await this.registerToken(token);
        }
    }
};
