import { PaymentMethod, RideRequest, RideOption, TransactionType } from '../types';

// --- Constants ---
const COMMISSION_RATE = 0.20; // 20% to Platform
const RUNNER_SHARE = 0.80;    // 80% to Runner
const STOP_FEE_SHORT = 25;
const MOVER_HELPER_FEE = 150; // Flat fee PER helper
const QUEUE_RATE_PER_HOUR = 120; // R120 per hour for queueing
const QUEUE_MIN_FEE = 30; // Minimum R30 for any queueing task

// Pricing Windows
const PRICING_WINDOWS = {
  MORNING_DAY: { start: 6, end: 19, price: 60 },   // 06:00 - 19:59
  EVENING: { start: 20, end: 23, price: 80 },      // 20:00 - 23:59
  NIGHT: { start: 0, end: 5, price: 100 },         // 00:00 - 05:59
};

// Gateway Fees (Platform Cost) - iKhokha/Paystack
const GATEWAY_FEES = {
  [PaymentMethod.CARD]: 0.0285, // 2.85%
  [PaymentMethod.INSTANT_EFT]: 0.0200, // 2.00%
  [PaymentMethod.CASH]: 0,
  [PaymentMethod.PAYSTACK]: 0.029 // 2.9%
};

/**
 * Calculates the base fare based on the current time of day.
 */
export const getBaseFareByTime = (date: Date = new Date()): { label: string, price: number } => {
  const hour = date.getHours();

  if (hour >= PRICING_WINDOWS.NIGHT.start && hour <= PRICING_WINDOWS.NIGHT.end) {
    return { label: 'Night Rate (00:00 - 06:00)', price: PRICING_WINDOWS.NIGHT.price };
  }
  if (hour >= PRICING_WINDOWS.EVENING.start && hour <= PRICING_WINDOWS.EVENING.end) {
    return { label: 'Evening Rate (20:00 - 00:00)', price: PRICING_WINDOWS.EVENING.price };
  }
  return { label: 'Standard Rate (06:00 - 20:00)', price: PRICING_WINDOWS.MORNING_DAY.price };
};

/**
 * Calculates total trip price including stops and helpers.
 */
export const calculateTripPrice = (stops: number = 0, vehicleMultiplier: number = 1, helpersCount: number = 0): number => {
  const { price: base } = getBaseFareByTime();
  const stopsTotal = stops * STOP_FEE_SHORT;
  const helperTotal = helpersCount * MOVER_HELPER_FEE;
  
  const total = (base + stopsTotal + helperTotal) * vehicleMultiplier;
  return Math.ceil(total);
};

/**
 * Calculates the financial split for a completed trip.
 * Handles Reimbursements (Goods cost) which are 0% commission.
 */
export const calculateSettlement = (ride: RideRequest) => {
  const method = ride.paymentMethod;
  const grossFare = ride.price;
  const goodsCost = ride.errandDetails?.actualGoodsCost || 0; 
  
  // Calculate Queue Fee if applicable
  let queueFee = 0;
  if (ride.errandDetails?.queueDurationMinutes) {
      const hours = ride.errandDetails.queueDurationMinutes / 60;
      queueFee = Math.max(QUEUE_MIN_FEE, Math.ceil(hours * QUEUE_RATE_PER_HOUR));
  }

  // 1. Calculate Shares on FARE + QUEUE FEE (Platform takes commission on both)
  const totalServiceFee = grossFare + queueFee;
  const platformCommission = totalServiceFee * COMMISSION_RATE;
  const runnerEarnings = totalServiceFee * RUNNER_SHARE;

  // 2. Gateway Fees (Applied to total amount processed if Card)
  const totalTransactionAmount = totalServiceFee + goodsCost;
  const gatewayFeeRate = GATEWAY_FEES[method] || 0;
  const gatewayFeeAmount = totalTransactionAmount * gatewayFeeRate;
  
  // 3. Platform Revenue
  const platformNetRevenue = platformCommission - gatewayFeeAmount;

  return {
    grossFare: totalServiceFee,
    goodsCost,
    queueFee,
    totalCustomerPays: totalTransactionAmount,
    platformCommission,
    runnerEarnings,
    runnerReimbursement: goodsCost, 
    gatewayFeeAmount,
    platformNetRevenue,
    paymentMethod: method
  };
};

/**
 * Generates options for Rides
 */
export const generateRideOptions = (stopsCount: number): RideOption[] => {
    const { price: base } = getBaseFareByTime();
    const stopsTotal = stopsCount * STOP_FEE_SHORT;
    const baseTotal = base + stopsTotal;

    return [
      { id: '1', name: 'SwiftLite', price: baseTotal, time: '3 min', icon: 'local_taxi', desc: 'Affordable compact rides' },
      { id: '2', name: 'SwiftComfort', price: Math.ceil(baseTotal * 1.3), time: '5 min', icon: 'directions_car', desc: 'Newer cars with A/C' },
      { id: '3', name: 'SwiftXL', price: Math.ceil(baseTotal * 1.6), time: '8 min', icon: 'airport_shuttle', desc: '6 Seater or large luggage' },
    ];
};

// --- PRICING ENGINE (MULTI-ZONE) ---
// Must match server.ts logic for consistency

type Zone = 'ZONE_1' | 'ZONE_2' | 'ZONE_3' | 'ZONE_4';

export const RATE_CARDS = {
  ZONE_1: { // Metro Hustle (JHB, CPT, DBN)
    base: { day: 85, evening: 100, night: 150 },
    surcharges: { peakHour: 30, heavyLoad: 20, express: 50 }
  },
  ZONE_2: { // Secondary Cities (BFN, PE, EL)
    base: { day: 75, evening: 90, night: 120 },
    surcharges: { peakHour: 0, heavyLoad: 20, express: 30 }
  },
  ZONE_3: { // Bethlehem Standard (Towns)
    base: { day: 60, evening: 80, night: 100 },
    surcharges: { peakHour: 0, heavyLoad: 20, express: 30 }
  },
  ZONE_4: { // Rural & Township
    base: { day: 80, evening: 100, night: 120 },
    surcharges: { peakHour: 0, heavyLoad: 20, express: 30 }
  }
};

export const detectZone = (address: string): Zone => {
  const addr = (address || '').toLowerCase();
  if (addr.match(/johannesburg|sandton|pretoria|centurion|midrand|soweto|cape town|durban|umhlanga/)) return 'ZONE_1';
  if (addr.match(/bloemfontein|gqeberha|port elizabeth|east london|mbombela|nelspruit|polokwane|kimberley/)) return 'ZONE_2';
  if (addr.match(/rural|farm|location|village/)) return 'ZONE_4';
  return 'ZONE_3';
};

import { PricingService } from '../services/PricingService';
import { RunnerMode } from '../types';

/**
 * Generates options for Errands with Context-Aware Pricing
 */
export const getErrandOptions = (stopsCount: number, address: string = '', distanceKm: number = 5): RideOption[] => {
    // Default distance to 5km if not provided (e.g. initial load)
    
    const footPrice = PricingService.calculateErrandPrice({
        distanceKm: Math.min(distanceKm, 3), // Cap foot distance pricing
        stopsCount,
        vehicleType: RunnerMode.FOOT
    }).total;

    const bikePrice = PricingService.calculateErrandPrice({
        distanceKm,
        stopsCount,
        vehicleType: RunnerMode.MOTORBIKE
    }).total;

    const carPrice = PricingService.calculateErrandPrice({
        distanceKm,
        stopsCount,
        vehicleType: RunnerMode.CAR
    }).total;

    return [
        { id: 'e0', name: 'Foot Runner', price: footPrice, time: '10 min', icon: 'directions_walk', desc: 'Local errands (within 2km)' },
        { id: 'e1', name: 'Motorbike', price: bikePrice, time: '5 min', icon: 'two_wheeler', desc: 'Docs, Meds, Small Parcels' },
        { id: 'e2', name: 'Runner (Car)', price: carPrice, time: '8 min', icon: 'directions_car', desc: 'Groceries, Medium Boxes' },
    ];
};

/**
 * Generates options for Movers (Includes Helper Logic)
 */
export const getMoverOptions = (stopsCount: number, helpersCount: number, distanceKm: number = 10): RideOption[] => {
    // Default distance to 10km if not provided
    
    const microPrice = PricingService.calculateMovePrice({
        distanceKm,
        moveType: 'MICRO',
        helpersCount
    }).total;

    const fullPrice = PricingService.calculateMovePrice({
        distanceKm,
        moveType: 'FULL',
        helpersCount
    }).total;

    return [
        { id: 'm2', name: '1.5 Ton Truck', price: microPrice, time: '25 min', icon: 'airport_shuttle', desc: helpersCount > 0 ? `${helpersCount} Helper(s) incl.` : 'Transport Only' },
        { id: 'm3', name: '4 Ton Truck', price: fullPrice, time: '45 min', icon: 'front_loader', desc: 'Full home move (Heavy)' },
    ];
};