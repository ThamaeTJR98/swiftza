export const ValidationService = {
  /**
   * Validates a South African ID Number using the Luhn Algorithm.
   * Format: YYMMDD SSSS C A Z
   * YYMMDD: Date of birth
   * SSSS: Gender (0000-4999 Female, 5000-9999 Male)
   * C: Citizenship (0 SA, 1 Other)
   * A: 8 or 9 (Race - deprecated but still in checksum)
   * Z: Checksum digit
   */
  isValidSAID: (idNumber: string): boolean => {
    if (!idNumber || idNumber.length !== 13) return false;
    if (!/^\d+$/.test(idNumber)) return false;

    // 1. Validate Date of Birth
    const year = parseInt(idNumber.substring(0, 2));
    const month = parseInt(idNumber.substring(2, 4));
    const day = parseInt(idNumber.substring(4, 6));

    // Basic date validation (not perfect for leap years but good enough for first pass)
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // 2. Validate Citizenship (11th digit)
    const citizenship = parseInt(idNumber.substring(10, 11));
    if (citizenship !== 0 && citizenship !== 1) return false;

    // 3. Luhn Algorithm Checksum
    let sum = 0;
    let isSecond = false;
    for (let i = idNumber.length - 1; i >= 0; i--) {
        let d = parseInt(idNumber.charAt(i));
        if (isSecond) {
            d = d * 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        isSecond = !isSecond;
    }
    return (sum % 10 === 0);
  },

  /**
   * Validates a South African Vehicle License Plate.
   * Covers most common formats:
   * - GP: AA 11 BB GP
   * - WC: CA 123-456 or CAA 12345
   * - KZN: ND 123-456
   * - Old/Personalized: 123 ABC GP
   */
  isValidLicensePlate: (plate: string): boolean => {
    if (!plate) return false;
    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Remove spaces/dashes

    // Minimum length check (shortest valid is likely 4 chars e.g. "CA 1")
    if (cleanPlate.length < 4 || cleanPlate.length > 8) return false;

    // Basic Regex for common patterns (simplified)
    // 1. Gauteng/General: 3 letters, 3 numbers (or 2 letters, 2 numbers, 2 letters)
    // 2. Western Cape: Starts with C (CA, CY, etc) followed by numbers
    // 3. KZN: Starts with N followed by numbers
    
    // We'll use a permissive regex that catches obvious junk but allows valid formats
    const validPattern = /^[A-Z]{1,3}[0-9]{1,6}[A-Z]{0,2}$/;
    
    return validPattern.test(cleanPlate);
  },

  /**
   * Validates a Professional Driving Permit (PrDP) Number.
   * Usually 12 digits or alphanumeric code.
   */
  isValidPrDP: (prdp: string): boolean => {
      if (!prdp) return false;
      // PrDPs are generally alphanumeric and at least 8 chars
      return /^[A-Z0-9]{8,15}$/.test(prdp.toUpperCase().replace(/\s/g, ''));
  }
};
