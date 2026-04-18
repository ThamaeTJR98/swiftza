import { RideRequest } from '../types';

export const CommunicationService = {
  /**
   * Initiates a call between rider and driver.
   * In a production environment, this would use a VoIP provider (e.g., Twilio Proxy)
   * to mask the real phone numbers.
   * 
   * For MVP/Beta, we will use a direct tel link but wrap it in a privacy warning.
   */
  initiateCall: (phoneNumber: string, role: 'DRIVER' | 'RIDER') => {
    if (!phoneNumber) {
      alert("No phone number available.");
      return;
    }

    // POPIA Compliance Warning
    const confirmed = window.confirm(
      `PRIVACY NOTICE:\n\nYou are about to call the ${role.toLowerCase()}. \n\nNote: Your phone number will be visible to them on their caller ID.\n\nDo you want to proceed?`
    );

    if (confirmed) {
      window.location.href = `tel:${phoneNumber}`;
    }
  },

  /**
   * Sends a pre-defined message via WhatsApp (safer than SMS in SA context).
   * Does not expose the sender's number until they hit send in the app.
   */
  openWhatsApp: (phoneNumber: string, message: string) => {
    if (!phoneNumber) return;
    
    // Remove '+' and spaces for WA link
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    const encodedMsg = encodeURIComponent(message);
    
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMsg}`, '_blank');
  }
};
