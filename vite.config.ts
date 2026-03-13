
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // USER PROVIDED KEYS (Enhanced Fallbacks)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || env.SUPABASE_URL || 'https://ndbzamwgarfstploxvkz.supabase.co';
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kYnphbXdnYXJmc3RwbG94dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNzY2MjYsImV4cCI6MjA4Mzc1MjYyNn0.NdHdXVO8HdniQsRsKEptFjmzpp_rNxU-Hzi3DwOgP30';
  const GEMINI_KEY = process.env.API_KEY || env.API_KEY || 'AIzaSyAwumRJVAgeGhczfPFXhMdDgBdCiS-NJ74';
  
  // Maps Key: Check VITE_ prefixed first, then standard, then hardcoded fallback
  const MAPS_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || env.GOOGLE_MAPS_API_KEY || 'AIzaSyBdCypDQB-8xV4FZGSaP_2BvI02pLzzW40';

  return {
    base: './',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(GEMINI_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
      'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(MAPS_KEY),
    },
    build: {
      outDir: 'dist',
    }
  };
});
