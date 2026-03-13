import { supabase } from '../lib/supabase';
import { Vehicle } from '../types';

export const VehicleService = {
  /**
   * Fetches all vehicles owned by a driver from the dedicated table.
   */
  getDriverVehicles: async (driverId: string): Promise<Vehicle[]> => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', driverId);

    if (error) throw error;

    return (data || []).map(v => ({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      plate: v.plate,
      type: v.type,
      status: v.status,
      disc_expiry: v.disc_expiry,
      license_disk_url: v.license_disk_url,
      operating_license_no: v.operating_license_no,
      addedAt: v.created_at
    }));
  },

  /**
   * Adds a new vehicle with mandatory SA compliance fields.
   */
  addVehicle: async (driverId: string, vehicleData: Partial<Vehicle>) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        owner_id: driverId,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        plate: vehicleData.plate,
        type: vehicleData.type,
        disc_expiry: vehicleData.disc_expiry,
        license_disk_url: vehicleData.license_disk_url,
        operating_license_no: vehicleData.operating_license_no,
        insurance_expiry: vehicleData.insurance_expiry,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Validates if a vehicle is legally fit for e-hailing.
   */
  isVehicleCompliant: (vehicle: Vehicle): boolean => {
    if (vehicle.status !== 'VERIFIED' && vehicle.status !== 'APPROVED') return false;
    
    if (!vehicle.operating_license_no) return false;

    if (vehicle.disc_expiry) {
      const expiry = new Date(vehicle.disc_expiry);
      if (expiry < new Date()) return false;
    } else {
      return false;
    }

    // CRITICAL: Insurance Check
    if (vehicle.insurance_expiry) {
        const insExpiry = new Date(vehicle.insurance_expiry);
        if (insExpiry < new Date()) return false;
    } else {
        return false; // Mandatory
    }

    return true;
  }
};
