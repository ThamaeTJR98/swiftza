import { TransactionType, LedgerEntry } from '../types';
import { jsPDF } from 'jspdf';

export const VAT_RATE = 0.15; // South Africa Standard VAT Rate

export const FinancialService = {
  /**
   * Calculates VAT component for a given gross amount.
   * In SA, e-hailing fares are usually VAT inclusive.
   */
  calculateVAT: (grossAmount: number) => {
    // VAT = Gross - (Gross / 1.15)
    const netAmount = grossAmount / (1 + VAT_RATE);
    const vatAmount = grossAmount - netAmount;
    return {
      net: Number(netAmount.toFixed(2)),
      vat: Number(vatAmount.toFixed(2)),
      gross: grossAmount
    };
  },

  /**
   * Generates a summary of earnings for SARS reporting.
   */
  getEarningsSummary: (ledger: LedgerEntry[], year: number) => {
    const startDate = new Date(year, 2, 1); // SA Tax Year starts 1 March
    const endDate = new Date(year + 1, 1, 28); // Ends 28/29 Feb

    const filtered = ledger.filter(entry => {
      const d = new Date(entry.date);
      return d >= startDate && d <= endDate;
    });

    const grossEarnings = filtered
      .filter(e => e.type === TransactionType.TRIP_EARNING)
      .reduce((sum, e) => sum + e.amount, 0);

    const commission = filtered
      .filter(e => e.type === TransactionType.COMMISSION_OWED)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);

    const vatCollected = grossEarnings * (VAT_RATE / (1 + VAT_RATE));

    return {
      year,
      grossEarnings: Number(grossEarnings.toFixed(2)),
      netEarnings: Number((grossEarnings - commission - vatCollected).toFixed(2)),
      commission: Number(commission.toFixed(2)),
      vatCollected: Number(vatCollected.toFixed(2)),
      taxYear: `${year}/${year + 1}`
    };
  },

  /**
   * Generates a downloadable PDF Tax Certificate (Earnings Summary).
   */
  generateTaxCertificate: async (user: any, year: number) => {
    const doc = new jsPDF();
    const summary = FinancialService.getEarningsSummary(user.wallet.ledger || [], year);
    
    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(0, 196, 180); // Brand Teal
    doc.text("SwiftZA", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("E-Hailing Platform Earnings Summary", 20, 26);
    doc.text(`Tax Year: 1 March ${year} - 28 Feb ${year + 1}`, 20, 32);

    // 2. Driver Details
    doc.setDrawColor(200);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("DRIVER DETAILS", 20, 50);
    
    doc.setFontSize(10);
    doc.text(`Name: ${user.name}`, 20, 60);
    doc.text(`ID Number: ${user.id_number || 'N/A'}`, 20, 66);
    doc.text(`Tax Ref No: ${user.tax_ref || 'Not Provided'}`, 20, 72);
    doc.text(`Address: ${user.address || 'Not Provided'}`, 20, 78);

    // 3. Financial Summary Table
    doc.line(20, 85, 190, 85);
    doc.setFontSize(12);
    doc.text("FINANCIAL SUMMARY (ZAR)", 20, 95);

    let y = 105;
    const addRow = (label: string, value: number, isBold = false) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.text(label, 20, y);
        doc.text(`R ${value.toFixed(2)}`, 150, y, { align: 'right' });
        y += 8;
    };

    addRow("Gross Trip Earnings (Incl. VAT)", summary.grossEarnings);
    addRow("Less: Platform Commission (20%)", -summary.commission);
    addRow("Less: VAT Component (15%)", -summary.vatCollected);
    
    y += 4;
    doc.line(20, y, 190, y);
    y += 10;
    
    addRow("NET PAYOUT EARNINGS", summary.netEarnings, true);

    // 4. Disclaimer
    y += 20;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("DISCLAIMER: This document is a summary of earnings processed through the SwiftZA platform.", 20, y);
    doc.text("It is not an official IRP5. You are responsible for declaring your own income to SARS.", 20, y + 5);
    doc.text("Amounts include VAT where applicable. Consult a tax practitioner for advice.", 20, y + 10);

    // 5. Footer
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text("SwiftZA (Pty) Ltd - Reg: 2024/123456/07", 120, 280);

    // 6. Save
    doc.save(`SwiftZA_Tax_Summary_${year}_${user.name.replace(/\s+/g, '_')}.pdf`);

    return {
      success: true,
      url: null // Client-side download, no URL needed
    };
  }
};
