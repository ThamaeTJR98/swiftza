import { createClient } from '@supabase/supabase-js';
import { safeStorage } from '../utils/safeStorage';

const getEnv = (key: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    if ((import.meta as any).env && (import.meta as any).env[key]) {
        return (import.meta as any).env[key];
    }
    return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';

const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

// Custom lock implementation to bypass Navigator LockManager timeout issues
const customLock = async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
    return await fn();
};

// Custom storage for Supabase to prevent SecurityError in iframes
const supabaseStorage = {
    getItem: (key: string) => safeStorage.getItem(key),
    setItem: (key: string, value: string) => safeStorage.setItem(key, value),
    removeItem: (key: string) => safeStorage.removeItem(key),
};

export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        lock: customLock,
        storage: supabaseStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
