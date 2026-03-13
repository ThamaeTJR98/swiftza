import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export const RegulatoryService = {
  /**
   * Generates a CSV report for the National Public Transport Regulator (NPTR).
   * Includes all active drivers, their vehicles, and license details.
   */
  generateNPTRReport: async () => {
    try {
      // 1. Fetch all drivers with their vehicles
      const { data: drivers, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          id_number,
          operating_license_no,
          prdp_expiry,
          is_verified,
          vehicles (
            make,
            model,
            plate,
            operating_license_no,
            disc_expiry
          )
        `)
        .eq('role', UserRole.DRIVER);

      if (error) throw error;

      if (!drivers || drivers.length === 0) {
        alert("No driver data found for report.");
        return;
      }

      // 2. Format Data for CSV
      const headers = [
        "Driver Name",
        "Contact Number",
        "RSA ID Number",
        "Driver Operating License",
        "PrDP Expiry",
        "Status",
        "Vehicle Make/Model",
        "Vehicle Plate",
        "Vehicle Operating License",
        "License Disc Expiry"
      ];

      const rows = drivers.map((d: any) => {
        const v = d.vehicles && d.vehicles.length > 0 ? d.vehicles[0] : {};
        return [
          d.full_name || "Unknown",
          d.phone || "N/A",
          d.id_number || "MISSING",
          d.operating_license_no || "MISSING",
          d.prdp_expiry || "MISSING",
          d.is_verified ? "ACTIVE" : "PENDING",
          `${v.make || ''} ${v.model || ''}`.trim() || "No Vehicle",
          v.plate || "N/A",
          v.operating_license_no || "N/A",
          v.disc_expiry || "N/A"
        ].map(field => `"${field}"`).join(","); // Quote fields to handle commas
      });

      const csvContent = [headers.join(","), ...rows].join("\n");

      // 3. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `NPTR_Compliance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e: any) {
      console.error("Failed to generate NPTR report:", e);
      alert("Error generating report: " + e.message);
    }
  }
};
