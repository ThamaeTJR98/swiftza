
let mapPromise: Promise<void> | null = null;

// Use a known demo key if specific one fails, or stick to the one configured.
const FALLBACK_KEY = 'AIzaSyBdCypDQB-8xV4FZGSaP_2BvI02pLzzW40'; 

export const loadGoogleMaps = (): Promise<void> => {
  if (mapPromise) return mapPromise;

  mapPromise = new Promise((resolve, reject) => {
    // 1. Check if Google Maps is already available
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    // 2. Resolve Key
    let apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_API;
    
    if (!apiKey && typeof process !== 'undefined' && process.env) {
        apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API;
    }

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'undefined') {
        console.log("[MapLoader] Env Key missing. Using Fallback.");
        apiKey = FALLBACK_KEY;
    }

    // 3. Setup Global Callback
    const callbackName = 'initGoogleMapsCallback';
    (window as any)[callbackName] = () => {
        console.log("[MapLoader] Global Callback Fired");
        resolve();
    };

    // 4. Check if script is already in DOM (avoid duplicates)
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
        console.log("[MapLoader] Script already exists. Waiting for object...");
        // Poll for google.maps since script exists but object might not be ready
        const checkInterval = setInterval(() => {
            if ((window as any).google && (window as any).google.maps) {
                clearInterval(checkInterval);
                console.log("[MapLoader] Polling success.");
                resolve();
            }
        }, 100);
        
        // Safety timeout for polling
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!((window as any).google && (window as any).google.maps)) {
                reject(new Error("SCRIPT_LOADED_BUT_MAPS_MISSING"));
            }
        }, 10000);
        return;
    }

    // 5. Inject Script - Added 'marker' library
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onerror = (err) => {
        console.error("Google Maps Script Load Error:", err);
        reject(new Error("NETWORK_ERROR"));
    };

    // Auth Failure Handler
    (window as any).gm_authFailure = () => {
        const msg = "Google Maps Authentication Failed. Invalid API Key.";
        console.error(msg);
        window.dispatchEvent(new CustomEvent('map-auth-failure', { detail: { message: msg } }));
    };
    
    document.head.appendChild(script);
    console.log(`[MapLoader] Script injected with libraries including marker. Key ending ...${apiKey?.slice(-4)}`);
  });

  return mapPromise;
};
