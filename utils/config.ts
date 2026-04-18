
export const Config = {
  // Toggle this to FALSE for production builds
  USE_MOCKS: (import.meta as any).env?.MODE === 'development' || false,
  
  // Feature Flags
  FEATURES: {
    NATIVE_GEOLOCATION: true,
    AI_SAFETY_TIPS: true,
  },

  // API Configuration
  API_TIMEOUT: 15000, // 15s timeout
};
