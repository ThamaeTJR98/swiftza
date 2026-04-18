
export enum AppView {
  ONBOARDING = 'ONBOARDING',
  POPIA_CONSENT = 'POPIA_CONSENT',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  DRIVER_HOME = 'DRIVER_HOME',
  REQUEST_RIDE = 'REQUEST_RIDE',
  FINDING_RUNNER = 'FINDING_RUNNER',
  TRACKING = 'TRACKING',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
  RIDE_COMPLETE = 'RIDE_COMPLETE',
  CHAT = 'CHAT',
  ADMIN = 'ADMIN',
  HELP_SUPPORT = 'HELP_SUPPORT',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  COOKIE_POLICY = 'COOKIE_POLICY',
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  SAVED_PLACES = 'SAVED_PLACES'
}

export enum UserRole {
  CREATOR = 'CREATOR',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export enum RideStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  ARRIVED_PICKUP = 'ARRIVED_PICKUP', 
  VERIFYING_RIDE = 'VERIFYING_RIDE', 
  SHOPPING = 'SHOPPING',             
  IN_PROGRESS = 'IN_PROGRESS',       
  ARRIVED_DROPOFF = 'ARRIVED_DROPOFF', 
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD', // Generic Card
  PAYSTACK = 'PAYSTACK', // SA Specific Gateway
  INSTANT_EFT = 'INSTANT_EFT'
}

export enum TransactionType {
  TRIP_EARNING = 'TRIP_EARNING',      
  COMMISSION_OWED = 'COMMISSION_OWED', 
  PAYOUT = 'PAYOUT',
  REIMBURSEMENT = 'REIMBURSEMENT', // New: Paying back runner for goods
  ADJUSTMENT = 'ADJUSTMENT',
  VAT_COLLECTED = 'VAT_COLLECTED' // New: 15% VAT component
}

export enum ComplianceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  EXPIRING_SOON = 'EXPIRING_SOON',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: string;
    plate: string;
    type: 'Car' | 'Motorbike' | 'Truck';
    seaterCount?: number;
    photos?: {
        exterior: string;
        interior: string;
    };
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'IN_PROGRESS' | 'APPROVED';
    disc_expiry?: string;
    license_disk_url?: string;
    operating_license_no?: string; // Mandatory for SA E-hailing
    insurance_expiry?: string; // CRITICAL: Commercial Insurance Expiry
    addedAt: string;
}

export interface Review {
    rating: number;
    tags: string[]; 
    comment?: string;
    tipAmount?: number;
}

export interface DriverDocument {
    id: string;
    driverId: string;
    type: 'LICENSE' | 'PRDP' | 'VEHICLE_COF' | 'INSURANCE' | 'CRIMINAL_CHECK';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    documentUrl?: string;
    expiryDate?: string;
    metadata?: any;
}

export interface Incident {
    id: string;
    rideId?: string;
    reporterId: string;
    type: 'PANIC' | 'ACCIDENT' | 'HARASSMENT' | 'OTHER';
    lat: number;
    lng: number;
    description?: string;
    resolved: boolean;
    createdAt: string;
}

export interface TaxCertificate {
    id: string;
    year: number;
    type: 'IT3(a)' | 'VAT201' | 'EARNINGS_SUMMARY';
    url: string;
    issuedDate: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface SafetyAlert {
  type: 'deviation' | 'stopped' | 'mismatch' | 'panic';
  ride_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface LedgerEntry {
  id: string;
  rideId?: string;
  date: string; 
  description: string;
  type: TransactionType;
  amount: number; 
  balanceAfter: number;
  paymentMethod?: PaymentMethod;
}

export interface Wallet {
  balance: number;
  currency: string;
  ledger: LedgerEntry[];
  lastPayoutDate?: string;
  isPayoutEligible: boolean; 
  todaysEarnings?: number; // New: Cached today's earnings
}

export interface UserPreferences {
    locationSharing: boolean;
    personalizedAds: boolean;
    marketingEmails?: boolean;
}

export interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchCode: string;
    accountType: 'Savings' | 'Cheque';
}

export enum PayoutStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  rating?: number;
  wallet: Wallet;
  profileUrl?: string; // New: Profile Picture URL
  preferences?: UserPreferences; // NEW: Added preferences
  isVerified?: boolean;
  isOnline?: boolean; // New: Duty status
  isDemo?: boolean; 
  kycStatus?: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'; 
  complianceStatus?: ComplianceStatus;
  prdpExpiry?: string;
  operatingLicenseNo?: string;
  
  // Specific Document Statuses
  documentStatus?: {
      license?: 'MISSING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
      prdp?: 'MISSING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  };

  vehicleType?: 'Motorbike' | 'Car' | 'Truck'; 
  fleet?: Vehicle[];
  licensedProvince?: string; // CRITICAL: For Geo-Jurisdiction Enforcement
  emergencyContacts?: EmergencyContact[];
  bankDetails?: BankDetails;
  metadata?: {
    popia_consent?: boolean;
    consent_date?: string;
    policy_version?: string;
    deletion_requested_at?: string;
    [key: string]: any;
  };
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface ProofOfDelivery {
  photoUrl?: string;
  recipientName?: string;
  timestamp: string;
}

export enum ErrandCategory {
  // 1. Shopping & Delivery
  GROCERY_SHOPPING = 'GROCERY_SHOPPING',
  FOOD_PICKUP = 'FOOD_PICKUP',
  PHARMACY_PICKUP = 'PHARMACY_PICKUP',
  RETAIL_SHOPPING = 'RETAIL_SHOPPING',
  SPECIALISED_PURCHASE = 'SPECIALISED_PURCHASE',

  // 2. Pickup & Drop-Off
  PACKAGE_DELIVERY = 'PACKAGE_DELIVERY',
  DOCUMENT_DELIVERY = 'DOCUMENT_DELIVERY',
  OFFICE_ADMIN = 'OFFICE_ADMIN',
  BANKING_ERRAND = 'BANKING_ERRAND',

  // 3. Personal & Household
  LAUNDRY = 'LAUNDRY',
  HOME_ESSENTIALS = 'HOME_ESSENTIALS',
  PERSONAL_SHOPPING = 'PERSONAL_SHOPPING',

  // 4. Administrative & Queue-Handling
  GOVT_QUEUE = 'GOVT_QUEUE',
  BANK_QUEUE = 'BANK_QUEUE',
  FORM_SUBMISSION = 'FORM_SUBMISSION',

  // 5. Lifestyle & Family
  GIFT_EVENT = 'GIFT_EVENT',
  SCHOOL_RUN = 'SCHOOL_RUN',
  ELDERLY_SUPPORT = 'ELDERLY_SUPPORT',

  // 6. Business & Corporate
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  INTER_OFFICE_COURIER = 'INTER_OFFICE_COURIER',
  SMALL_BIZ_LOGISTICS = 'SMALL_BIZ_LOGISTICS',

  // 7. Custom & On-Demand
  CUSTOM_TASK = 'CUSTOM_TASK',
  CONCIERGE = 'CONCIERGE',

  // 8. Specialised
  PET_CARE = 'PET_CARE',
  HEAVY_LIFTING = 'HEAVY_LIFTING',
  FURNITURE_MOVE = 'FURNITURE_MOVE',
  APARTMENT_MOVE = 'APARTMENT_MOVE'
}

export enum RunnerMode {
  FOOT = 'FOOT',
  MOTORBIKE = 'MOTORBIKE',
  CAR = 'CAR',
  TRUCK = 'TRUCK'
}

export interface ErrandItem {
    id: string;
    name: string;
    quantity: string;
    estimatedPrice?: number;
    actualPrice?: number;
    category?: string; 
    status?: 'PENDING' | 'FOUND' | 'UNAVAILABLE' | 'SUBSTITUTED' | 'COMPLETED'; // Granular status
    description?: string;
    brand?: string;
}

export interface RideStop {
  id: string;
  type: 'PICKUP' | 'DROPOFF' | 'SHOPPING' | 'QUEUE';
  address: string;
  lat: number;
  lng: number;
  status: 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED';
  instructions?: string;
  customerName?: string;
  customerPhone?: string;
  items?: ErrandItem[]; // For specific items at this stop
  proofOfDelivery?: ProofOfDelivery;
}

export interface RideRequest {
  id: string;
  type: 'ride' | 'errand' | 'move';
  pickup: Location; // Keep for backward compatibility (initial pickup)
  waypoints?: Location[]; // Keep for backward compatibility
  dropoff: Location; // Keep for backward compatibility (final dropoff)
  
  // NEW: Structured Multi-Stop Support
  stops: RideStop[];
  currentStopIndex: number;

  price: number; 
  paymentMethod: PaymentMethod; 
  distance: string;
  status: RideStatus;
  otp?: string; 
  driver_id?: string;
  passenger?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    photoUrl?: string;
  };
  driver?: {
    id?: string;
    name: string;
    vehicle: string;
    plate: string;
    phone: string;
    rating: number;
    mode?: RunnerMode;
    photoUrl?: string;
  };
  
  errandDetails?: {
    category: ErrandCategory;
    recipientName: string;
    packageSize: 'small' | 'medium' | 'large' | 'furniture';
    instructions: string; 
    items?: ErrandItem[]; 
    attachmentUrl?: string;      
    itemsChecked?: boolean; 
    
    // Financials
    estimatedGoodsCost?: number; 
    actualGoodsCost?: number;    
    purchaseStatus?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'; 
    receiptUrl?: string;         
    
    // Queue Handling
    queueStartTime?: string;
    queueEndTime?: string;
    queueDurationMinutes?: number;
    queueRatePerHour?: number;
    queueLocationVerified?: boolean;

    // Movers
    helpersNeeded?: boolean; // Deprecated, kept for compat
    helpersCount?: number;   // New: Exact count
    helperFee?: number;
    loadPhotoUrl?: string; 
    loadingStartTime?: string; // For timing the loading phase
  };
  proofOfDelivery?: ProofOfDelivery;
  cancellationReason?: string;
  review?: Review;
}

export interface RideOption {
  id: string;
  name: string;
  price: number;
  time: string;
  icon: string;
  desc: string;
  vehicleTypeFilter?: string[]; 
}

export interface RunnerLocation {
    driver_id: string;
    lat: number;
    lng: number;
    heading: number;
    last_updated: string;
    mode?: RunnerMode;
    name?: string;
    rating?: number;
}

export interface ChatMessage {
    id: string;
    sender: 'me' | 'other';
    text: string;
    timestamp: Date;
    isRead: boolean;
}

export interface RideHistoryItem {
    id: string;
    date: string;
    pickup: string;
    dropoff: string;
    price: number;
    status: 'Completed' | 'Cancelled';
    driver: string;
    rating: number;
    mapUrl?: string; 
    breakdown: {
        baseFare: number;
        distanceFare: number;
        stops: number;
        tax: number;
        total: number;
    }
}

export interface SavedPlace {
    id: string;
    user_id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    icon: string;
}
