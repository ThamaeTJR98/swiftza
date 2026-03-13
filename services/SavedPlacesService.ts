
import { supabase } from "../lib/supabase";
import { SavedPlace } from "../types";

export const SavedPlacesService = {

    async getPlaces(): Promise<SavedPlace[]> {
        try {
            const { data, error } = await supabase
                .from('saved_places')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('not found')) {
                    console.warn("Saved places table not found. Please run the SQL setup.");
                    return [];
                }
                throw new Error(error.message);
            }
            return data || [];
        } catch (e) {
            console.error("Error fetching saved places:", e);
            return [];
        }
    },

    async addPlace(place: Omit<SavedPlace, 'id' | 'user_id'>): Promise<SavedPlace> {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        // Handle Demo Users
        if (!user) {
            console.warn("User not authenticated with Supabase. Creating local-only saved place for demo.");
            return {
                ...place,
                id: `demo_${Date.now()}`,
                user_id: 'demo_user',
                created_at: new Date().toISOString()
            } as SavedPlace;
        }

        const { data, error } = await supabase
            .from('saved_places')
            .insert([{ ...place, user_id: user.id }])
            .select()
            .single();
        
        if (error) throw new Error(error.message);
        return data;
    },

    async updatePlace(id: string, updates: Partial<SavedPlace>): Promise<SavedPlace> {
        if (id.startsWith('demo_')) {
            return { id, ...updates } as SavedPlace;
        }

        const { data, error } = await supabase
            .from('saved_places')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async deletePlace(id: string): Promise<void> {
        if (id.startsWith('demo_')) return;

        const { error } = await supabase
            .from('saved_places')
            .delete()
            .eq('id', id);
        
        if (error) throw new Error(error.message);
    }
};
