
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../Icons';
import { FinancialService, VAT_RATE } from '../../services/FinancialService';
import { TaxCertificate } from '../../types';

interface EarningsTaxProps {
    onBack: () => void;
}

export const EarningsTax: React.FC<EarningsTaxProps> = ({ onBack }) => {
    const { user } = useApp();
    const [selectedMonth, setSelectedMonth] = useState<string>('Oct');
    const [isStatementOpen, setIsStatementOpen] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [certificates, setCertificates] = useState<TaxCertificate[]>([]);

    if (!user) return null;

    const isDemo = user.isDemo;

    // Compact Trend Data
    const trendData = useMemo(() => isDemo 
        ? [
            { month: 'May', amount: 4200 },
            { month: 'Jun', amount: 6800 },
            { month: 'Jul', amount: 5500 },
            { month: 'Aug', amount: 8900 },
            { month: 'Sep', amount: 7200 },
            { month: 'Oct', amount: 12450 },
          ]
        : Array(6).fill({ month: '-', amount: 0 }), [isDemo]);

    const maxAmount = Math.max(...trendData.map(d => d.amount)) || 100;

    // Financial Calculations using Service
    const selectedData = trendData.find(d => d.month === selectedMonth) || trendData[5];
    const financials = useMemo(() => {
        const gross = selectedData.amount;
        const commission = gross * 0.2;
        const vatInfo = FinancialService.calculateVAT(gross);
        return {
            gross,
            commission,
            vat: vatInfo.vat,
            net: gross - commission - vatInfo.vat
        };
    }, [selectedData]);

    const handleGenerateCert = async () => {
        setIsGenerating(true);
        try {
            const result = await FinancialService.generateTaxCertificate(user.id, 2025);
            if (result.success) {
                // Create a local record for UI display
                const newCert: TaxCertificate = {
                    id: `local_${Date.now()}`,
                    year: 2025,
                    type: 'IT3(a)',
                    url: '#', // Download handled by jsPDF
                    issuedDate: new Date().toISOString()
                };
                setCertificates([newCert, ...certificates]);
                alert("IT3(a) Tax Certificate generated successfully.");
            }
        } catch (e) {
            alert("Failed to generate certificate.");
        } finally {
            setIsGenerating(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col font-sans text-slate-900 animate-slide-up h-[100dvh]">
            
            {/* Header */}
            <div className="flex items-center bg-white/90 backdrop-blur-md px-4 py-2 pt-safe-top justify-between sticky top-0 z-10 border-b border-slate-100 h-[56px] shrink-0">
                <button 
                    onClick={onBack}
                    className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <Icon name="arrow_back_ios_new" className="text-lg text-slate-600" />
                </button>
                <h2 className="text-slate-900 text-sm font-bold leading-tight flex-1 text-center pr-8">Financials & Tax</h2>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 px-4 pt-3 pb-24 gap-3 overflow-y-auto no-scrollbar">
                
                {/* Hero + Chart Container */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg shrink-0 flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Net Payout ({selectedMonth})</p>
                            <h1 className="text-3xl font-extrabold tracking-tight">R {financials.net.toFixed(2)}</h1>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                            <Icon name="trending_up" className="text-emerald-400 text-[10px]" />
                            <span className="text-[10px] font-bold text-emerald-400">{isDemo ? '+15%' : '0%'}</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="flex justify-between items-end h-16 gap-2 mt-4">
                         {trendData.map((item, i) => {
                             const isSelected = selectedMonth === item.month;
                             const heightPercent = Math.max(10, (item.amount / maxAmount) * 100);
                             
                             return (
                                 <div 
                                    key={i} 
                                    onClick={() => setSelectedMonth(item.month)}
                                    className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                                 >
                                    <div 
                                        className={`w-full rounded-sm transition-all duration-300 relative ${isSelected ? 'bg-brand-teal' : 'bg-slate-700 hover:bg-slate-600'}`} 
                                        style={{ height: `${heightPercent}%` }}
                                    ></div>
                                    <span className={`text-[8px] font-bold uppercase ${isSelected ? 'text-brand-teal' : 'text-slate-500'}`}>{item.month}</span>
                                 </div>
                             );
                         })}
                    </div>
                </div>

                {/* SARS Compliance Note */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3">
                    <Icon name="info" className="text-blue-500 text-lg" />
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                        SwiftZA automatically calculates the 15% VAT component and platform commission for your SARS returns.
                    </p>
                </div>

                {/* Breakdown List */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div 
                        onClick={() => setIsStatementOpen(!isStatementOpen)}
                        className="px-4 py-3 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between cursor-pointer"
                    >
                        <h3 className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Monthly Breakdown</h3>
                        <Icon name={isStatementOpen ? "expand_less" : "expand_more"} className="text-slate-400" />
                    </div>
                    
                    {isStatementOpen && (
                        <div className="divide-y divide-slate-50 animate-fade-in">
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                                        <Icon name="payments" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Gross Fares</p>
                                        <p className="text-[9px] text-slate-400">VAT Inclusive</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-slate-900">R {financials.gross.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
                                        <Icon name="gavel" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">VAT (15%)</p>
                                        <p className="text-[9px] text-slate-400">SARS Component</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-blue-600">- R {financials.vat.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500">
                                        <Icon name="account_balance_wallet" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Platform Fee</p>
                                        <p className="text-[9px] text-slate-400">20% Commission</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-rose-500">- R {financials.commission.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-between px-4 py-3 bg-brand-teal/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-teal text-white shadow-sm">
                                        <Icon name="check_circle" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-brand-teal">Net Payout</p>
                                        <p className="text-[9px] text-brand-teal/70">To Bank Account</p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-brand-teal">R {financials.net.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tax Certificates */}
                <section className="space-y-3">
                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1">Tax Certificates</h3>
                    <div className="space-y-2">
                        {certificates.map(cert => (
                            <div key={cert.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Icon name="picture_as_pdf" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{cert.type} - {cert.year}</p>
                                        <p className="text-[9px] text-slate-400">Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button className="text-brand-teal text-[10px] font-black uppercase tracking-widest">Download</button>
                            </div>
                        ))}
                        
                        <button 
                            onClick={handleGenerateCert}
                            disabled={isGenerating}
                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-brand-teal hover:text-brand-teal transition-all flex items-center justify-center gap-2"
                        >
                            {isGenerating ? <span className="animate-spin material-symbols-rounded">progress_activity</span> : <Icon name="add" />}
                            {isGenerating ? 'Generating...' : 'Generate 2025 IT3(a)'}
                        </button>
                    </div>
                </section>

                <p className="text-[9px] text-center text-slate-400 px-4 pb-4">
                    SwiftZA acts as a collection agent. You are responsible for your own income tax submissions to SARS.
                </p>
            </div>
        </div>,
        document.body
    );
};
