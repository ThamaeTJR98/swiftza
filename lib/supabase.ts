import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    if ((import.meta as any).env && (import.meta as any).env[key]) {
        return (import.meta as any).env[key];
    }
    return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder';

// Custom lock implementation to bypass Navigator LockManager timeout issues
const customLock = async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
    return await fn();
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        lock: customLock,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});