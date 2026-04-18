import { ErrandCategory, PaymentMethod, RideRequest, RideStatus, RunnerMode } from '../types';

// --- CONSTANTS & RATES ---

export const PRICING_CONSTANTS = {
    // General
    VAT_RATE: 0.15,
    PLATFORM_COMMISSION: 0.20, // 20%
    
    // Errands (Standard)
    ERRAND_BASE_FEE: 50,
    ERRAND_PER_KM: 10, // R10/km
    ERRAND_PER_KM_LONG: 8, // R8/km after 5km
    ERRAND_WAIT_PER_MIN: 2, // R2/min
    ERRAND_STOP_FEE: 25,
    ERRAND_URGENCY_MULTIPLIER: 1.5,
    
    // Shopping Specific
    SHOPPING_SERVICE_FEE_PERCENT: 0.0, // Currently 0, relying on delivery fee
    
    // Queueing
    QUEUE_BASE_FEE: 50,
    QUEUE_HOURLY_RATE: 120, // R120/hr
    QUEUE_MIN_BLOCK_MINUTES: 15, // Bill in 15 min blocks
    
    // Moves - Micro (Bakkie/Van)
    MOVE_MICRO_BASE: 400,
    MOVE_MICRO_PER_KM: 15,
    MOVE_MICRO_HELPER_FEE: 150, // Per helper
    
    // Moves - Full (Truck)
    MOVE_FULL_BASE: 1500,
    MOVE_FULL_PER_KM: 25,
    MOVE_FULL_HELPER_FEE: 200,
    
    // Move Complexity
    MOVE_STAIRS_FEE_PER_FLOOR: 50, // Per floor if no elevator
    MOVE_HEAVY_ITEM_FEE: 100, // Per heavy item declared
    
    // Insurance
    INSURANCE_RATE: 0.02, // 2% of declared value
    INSURANCE_MIN_FEE: 50,
};

// --- INTERFACES ---

export interface ErrandPricingParams {
    distanceKm: number;
    stopsCount?: number;
    isUrgent?: boolean;
    waitMinutes?: number;
    vehicleType?: RunnerMode;
}

export interface QueuePricingParams {
    durationMinutes: number;
    distanceKm?: number; // Travel to queue
}

export interface MovePricingParams {
    distanceKm: number;
    moveType: 'MICRO' | 'FULL';
    helpersCount: number;
    floors?: number;
    hasElevator?: boolean;
    heavyItemsCount?: number;
    declaredValue?: number; // For insurance
    includeInsurance?: boolean;
}

export interface PriceBreakdown {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    specialFees: number; // Stops, Stairs, Heavy items
    insuranceFee: number;
    subTotal: number;
    vat: number;
    total: number;
    currency: string;
    
    // Metadata for UI
    details: { label: string; amount: number }[];
}

// --- SERVICE CLASS ---

export const PricingService = {
    
    /**
     * Calculate price for Standard Errands (Shopping, Pickup, Courier)
     */
    calculateErrandPrice: (params: ErrandPricingParams): PriceBreakdown => {
        const { distanceKm, stopsCount = 0, isUrgent = false, waitMinutes = 0, vehicleType = RunnerMode.CAR } = params;
        
        // 1. Base Fee
        let baseFare = PRICING_CONSTANTS.ERRAND_BASE_FEE;
        if (vehicleType === RunnerMode.MOTORBIKE) baseFare *= 0.8;
        if (vehicleType === RunnerMode.FOOT) baseFare *= 0.5;
        
        // 2. Distance Fee (Tiered)
        let distanceFare = 0;
        if (distanceKm <= 5) {
            distanceFare = distanceKm * PRICING_CONSTANTS.ERRAND_PER_KM;
        } else {
            distanceFare = (5 * PRICING_CONSTANTS.ERRAND_PER_KM) + ((distanceKm - 5) * PRICING_CONSTANTS.ERRAND_PER_KM_LONG);
        }
        
        // 3. Time/Wait Fee
        const timeFare = waitMinutes * PRICING_CONSTANTS.ERRAND_WAIT_PER_MIN;
        
        // 4. Special Fees (Stops)
        const specialFees = stopsCount * PRICING_CONSTANTS.ERRAND_STOP_FEE;
        
        // Subtotal before multipliers
        let subTotal = baseFare + distanceFare + timeFare + specialFees;
        
        // Urgency Multiplier
        if (isUrgent) {
            subTotal *= PRICING_CONSTANTS.ERRAND_URGENCY_MULTIPLIER;
        }
        
        const vat = subTotal * PRICING_CONSTANTS.VAT_RATE;
        const total = Math.ceil(subTotal + vat);
        
        return {
            baseFare,
            distanceFare,
            timeFare,
            specialFees,
            insuranceFee: 0,
            subTotal,
            vat,
            total,
            currency: 'ZAR',
            details: [
                { label: 'Base Fee', amount: baseFare },
                { label: `Distance (${distanceKm.toFixed(1)}km)`, amount: distanceFare },
                { label: `Stops (${stopsCount})`, amount: specialFees },
                ...(waitMinutes > 0 ? [{ label: `Wait Time (${waitMinutes}m)`, amount: timeFare }] : []),
                ...(isUrgent ? [{ label: 'Urgency Surcharge', amount: subTotal - (baseFare + distanceFare + timeFare + specialFees) }] : [])
            ]
        };
    },

    /**
     * Calculate price for Queueing Tasks
     */
    calculateQueuePrice: (params: QueuePricingParams): PriceBreakdown => {
        const { durationMinutes, distanceKm = 0 } = params;
        
        // 1. Base Fee (Travel to location)
        const baseFare = PRICING_CONSTANTS.QUEUE_BASE_FEE + (distanceKm * PRICING_CONSTANTS.ERRAND_PER_KM);
        
        // 2. Time Fee (Blocked)
        // Round up to nearest 15 min block
        const blocks = Math.ceil(durationMinutes / PRICING_CONSTANTS.QUEUE_MIN_BLOCK_MINUTES);
        const billableMinutes = blocks * PRICING_CONSTANTS.QUEUE_MIN_BLOCK_MINUTES;
        const timeFare = (billableMinutes / 60) * PRICING_CONSTANTS.QUEUE_HOURLY_RATE;
        
        const subTotal = baseFare + timeFare;
        const vat = subTotal * PRICING_CONSTANTS.VAT_RATE;
        const total = Math.ceil(subTotal + vat);
        
        return {
            baseFare,
            distanceFare: 0, // Included in base for queues usually
            timeFare,
            specialFees: 0,
            insuranceFee: 0,
            subTotal,
            vat,
            total,
            currency: 'ZAR',
            details: [
                { label: 'Call-out Fee', amount: baseFare },
                { label: `Queue Time (${billableMinutes}m)`, amount: timeFare }
            ]
        };
    },

    /**
     * Calculate price for Moves (Micro & Full)
     */
    calculateMovePrice: (params: MovePricingParams): PriceBreakdown => {
        const { 
            distanceKm, 
            moveType, 
            helpersCount, 
            floors = 0, 
            hasElevator = false, 
            heavyItemsCount = 0,
            declaredValue = 0,
            includeInsurance = false
        } = params;
        
        const isFull = moveType === 'FULL';
        
        // 1. Base Fee
        const baseFare = isFull ? PRICING_CONSTANTS.MOVE_FULL_BASE : PRICING_CONSTANTS.MOVE_MICRO_BASE;
        
        // 2. Distance Fee
        const ratePerKm = isFull ? PRICING_CONSTANTS.MOVE_FULL_PER_KM : PRICING_CONSTANTS.MOVE_MICRO_PER_KM;
        const distanceFare = distanceKm * ratePerKm;
        
        // 3. Helper Fees
        const helperRate = isFull ? PRICING_CONSTANTS.MOVE_FULL_HELPER_FEE : PRICING_CONSTANTS.MOVE_MICRO_HELPER_FEE;
        const helperFees = helpersCount * helperRate;
        
        // 4. Complexity Fees (Stairs, Heavy Items)
        let stairsFee = 0;
        if (!hasElevator && floors > 0) {
            stairsFee = floors * PRICING_CONSTANTS.MOVE_STAIRS_FEE_PER_FLOOR;
        }
        
        const heavyItemFee = heavyItemsCount * PRICING_CONSTANTS.MOVE_HEAVY_ITEM_FEE;
        
        const specialFees = helperFees + stairsFee + heavyItemFee;
        
        // 5. Insurance
        let insuranceFee = 0;
        if (includeInsurance && declaredValue > 0) {
            insuranceFee = Math.max(PRICING_CONSTANTS.INSURANCE_MIN_FEE, declaredValue * PRICING_CONSTANTS.INSURANCE_RATE);
        }
        
        const subTotal = baseFare + distanceFare + specialFees + insuranceFee;
        const vat = subTotal * PRICING_CONSTANTS.VAT_RATE;
        const total = Math.ceil(subTotal + vat);
        
        return {
            baseFare,
            distanceFare,
            timeFare: 0,
            specialFees,
            insuranceFee,
            subTotal,
            vat,
            total,
            currency: 'ZAR',
            details: [
                { label: `Base Truck Fee (${isFull ? 'Full' : 'Micro'})`, amount: baseFare },
                { label: `Distance (${distanceKm.toFixed(1)}km)`, amount: distanceFare },
                { label: `Helpers (${helpersCount})`, amount: helperFees },
                ...(stairsFee > 0 ? [{ label: `Stairs Surcharge (${floors} floors)`, amount: stairsFee }] : []),
                ...(heavyItemFee > 0 ? [{ label: `Heavy Items (${heavyItemsCount})`, amount: heavyItemFee }] : []),
                ...(insuranceFee > 0 ? [{ label: 'Insurance Premium', amount: insuranceFee }] : [])
            ]
        };
    },
    
    /**
     * Calculate potential commission for a job
     */
    calculateCommission: (totalPrice: number): { platform: number, runner: number } => {
        // Simple split for now, can be made dynamic later
        const platform = totalPrice * PRICING_CONSTANTS.PLATFORM_COMMISSION;
        const runner = totalPrice - platform;
        return { platform, runner };
    }
};
