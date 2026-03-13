import { User, ComplianceStatus, UserRole } from '../types';

export const ComplianceService = {
  /**
   * Checks if a driver is legally cleared to accept trips in South Africa.
   * Aligned with National Land Transport Amendment Act requirements.
   */
  isClearToDrive: (user: User | null): boolean => {
    if (!user || user.role !== UserRole.DRIVER) return false;

    // 1. Check overall compliance status (Admin verified)
    if (user.complianceStatus !== ComplianceStatus.APPROVED && user.complianceStatus !== ComplianceStatus.EXPIRING_SOON) {
      return false;
    }

    // 2. Check PrDP Expiry
    if (user.prdpExpiry) {
      const expiry = new Date(user.prdpExpiry);
      if (expiry < new Date()) return false;
    } else {
      return false; // Mandatory field
    }

    // 3. Check Operating License
    if (!user.operatingLicenseNo) return false;

    // 4. Check KYC status
    if (user.kycStatus !== 'APPROVED') return false;

    return true;
  },

  /**
   * Calculates the status of a specific document based on its expiry date.
   */
  checkExpiryStatus: (expiryDate: string | undefined): ComplianceStatus => {
    if (!expiryDate) return ComplianceStatus.PENDING;

    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiry < now) return ComplianceStatus.SUSPENDED;
    if (expiry < thirtyDaysFromNow) return ComplianceStatus.EXPIRING_SOON;
    
    return ComplianceStatus.APPROVED;
  },

  /**
   * Returns a list of missing or expired requirements for UI feedback.
   */
  getMissingRequirements: (user: User | null): string[] => {
    if (!user || user.role !== UserRole.DRIVER) return [];
    const missing: string[] = [];

    if (!user.prdpExpiry) missing.push('Professional Driving Permit (PrDP)');
    else if (new Date(user.prdpExpiry) < new Date()) missing.push('Expired PrDP');

    if (!user.operatingLicenseNo) missing.push('E-hailing Operating License');
    
    if (user.kycStatus !== 'APPROVED') missing.push('Identity Verification (KYC)');
    
    if (!user.isVerified) missing.push('Admin Profile Approval');

    return missing;
  }
};
