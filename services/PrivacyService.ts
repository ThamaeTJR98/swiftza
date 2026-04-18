import { supabase } from '../lib/supabase';

export const PrivacyService = {
  /**
   * Logs a user's explicit consent to the POPIA policy.
   */
  recordConsent: async (userId: string, version: string = '1.0') => {
    // Fetch current settings_data to avoid overwriting other fields
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('settings_data')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentSettings = profile?.settings_data || {};

    const { error } = await supabase
      .from('profiles')
      .update({ 
        settings_data: { 
          ...currentSettings,
          popia_consent: true, 
          consent_date: new Date().toISOString(),
          policy_version: version 
        } 
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Simulates a Data Subject Access Request (DSAR).
   * In a real app, this would generate a PDF/JSON of all user data.
   */
  requestDataExport: async (userId: string) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      status: 'SUCCESS',
      message: 'Your data export has been prepared and sent to your registered email address.',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Handles Account Deletion (Right to be Forgotten).
   * Performs a "Soft Delete" by anonymizing PII while keeping the record for tax purposes.
   */
  requestAccountDeletion: async (userId: string) => {
    // 1. Anonymize PII immediately
    const anonymizedName = `Deleted User ${userId.substring(0, 8)}`;
    const anonymizedEmail = `deleted_${userId}@swiftza.app`;
    const anonymizedPhone = `+27000000000`;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: anonymizedName,
        email: anonymizedEmail,
        phone: anonymizedPhone,
        id_number: null, // Wipe RSA ID
        profile_url: null, // Wipe Photo
        status: 'DELETED',
        settings_data: { 
            deletion_requested_at: new Date().toISOString(),
            original_id: userId // Keep reference for audit trail
        }
      })
      .eq('id', userId);

    if (error) throw error;
    
    // 2. Sign out the user
    await supabase.auth.signOut();
  }
};
