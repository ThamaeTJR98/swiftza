import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { DriverDocument, Vehicle } from '../types';
import { ComplianceService } from '../services/ComplianceService';
import { VehicleService } from '../services/VehicleService';

export const useDriverCompliance = () => {
    const { user } = useApp();
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCompliant, setIsCompliant] = useState(true);
    const [blockingReason, setBlockingReason] = useState<string | null>(null);

    const checkCompliance = async () => {
        if (!user) return;
        
        // Demo Mode Bypass
        if (user.isDemo) {
            setLoading(false);
            setIsCompliant(true);
            setBlockingReason(null);
            setDocuments([]); 
            setVehicles([]);
            return;
        }

        setLoading(true);
        
        try {
            // 1. Fetch Documents
            const { data: docData, error: docError } = await supabase
                .from('driver_documents')
                .select('*')
                .eq('driver_id', user.id);

            if (docError) throw docError;
            setDocuments(docData as DriverDocument[]);

            // 2. Fetch Vehicles
            const vehicleData = await VehicleService.getDriverVehicles(user.id);
            setVehicles(vehicleData);

            // 3. Use ComplianceService for driver logic
            const driverClear = ComplianceService.isClearToDrive(user);
            const driverMissing = ComplianceService.getMissingRequirements(user);

            // 4. Check if at least one vehicle is compliant
            const hasCompliantVehicle = vehicleData.some(v => VehicleService.isVehicleCompliant(v));

            if (!driverClear) {
                setIsCompliant(false);
                setBlockingReason(`Driver Compliance: Missing or expired: ${driverMissing.join(', ')}`);
            } else if (!hasCompliantVehicle) {
                setIsCompliant(false);
                setBlockingReason("Vehicle Compliance: You must have at least one verified vehicle with a valid license disk and operating license.");
            } else {
                setIsCompliant(true);
                setBlockingReason(null);
            }
        } catch (err) {
            console.error('Compliance check failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'DRIVER') return;
        checkCompliance();
    }, [user]);

    return { documents, loading, isCompliant, blockingReason, refetch: checkCompliance };
};
