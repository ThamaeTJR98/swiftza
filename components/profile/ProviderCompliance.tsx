
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Icon } from '../Icons';
import { useDriverCompliance } from '../../hooks/useDriverCompliance';
import { DriverDocument } from '../../types';

interface ProviderComplianceProps {
    onBack: () => void;
}

export const ProviderCompliance: React.FC<ProviderComplianceProps> = ({ onBack }) => {
    const { user } = useApp();
    const { documents, loading: hookLoading, refetch } = useDriverCompliance();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingType, setUploadingType] = useState<string | null>(null);
    const [operatingLicenseNo, setOperatingLicenseNo] = useState(user?.operatingLicenseNo || '');
    const [prdpExpiry, setPrdpExpiry] = useState(user?.prdpExpiry || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to get doc status
    const getDoc = (type: string) => documents.find(d => d.type === type);
    const getStatus = (type: string) => getDoc(type)?.status || 'MISSING';

    // --- AUTOMATED CHECK (Didit Simulation) ---
    const handleStartVerification = async () => {
        setIsUploading(true);
        try {
            // Simulate Didit Flow
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Insert LICENSE record
            const { error } = await supabase.from('profiles').update({
                operating_license_no: operatingLicenseNo || 'OL-SA-' + Math.floor(Math.random() * 1000000),
                prdp_expiry: prdpExpiry || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
                compliance_status: 'APPROVED',
                is_verified: true
            }).eq('id', user?.id);

            if (error) throw error;
            
            await supabase.from('driver_documents').upsert({
                driver_id: user?.id,
                type: 'LICENSE',
                status: 'APPROVED',
                expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
                metadata: { source: 'Didit_KYC' }
            }, { onConflict: 'driver_id, type' });

            await refetch();
            alert("Identity & License Verified Successfully!");
        } catch (e: any) {
            alert("Verification failed: " + e.message);
        } finally {
            setIsUploading(false);
        }
    };

    // --- MANUAL UPLOAD ---
    const handleUploadClick = (type: string) => {
        setUploadingType(type);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0] || !uploadingType) return;
        
        setIsUploading(true);
        try {
            // Simulate Upload
            await new Promise(resolve => setTimeout(resolve, 1500));

            const { error } = await supabase.from('driver_documents').upsert({
                driver_id: user?.id,
                type: uploadingType,
                status: 'PENDING', // Needs manual review
                document_url: 'https://fake-url.com/doc.jpg',
                metadata: { filename: event.target.files[0].name }
            } as any); // Type cast if needed for upsert

            if (error) throw error;
            await refetch();
            alert(`${uploadingType} uploaded for review!`);
        } catch (e: any) {
            alert("Upload failed: " + e.message);
        } finally {
            setIsUploading(false);
            setUploadingType(null);
        }
    };

    // --- RENDER ITEM ---
    const DocItem = ({ type, title, sub, icon, actionLabel }: any) => {
        const doc = getDoc(type);
        const status = doc?.status || 'MISSING';
        
        const isVerified = status === 'APPROVED';
        const isPending = status === 'PENDING';
        const isMissing = status === 'MISSING';
        const isRejected = status === 'REJECTED';
        const isExpired = status === 'EXPIRED';

        return (
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isMissing || isRejected || isExpired ? 'bg-white border-brand-teal/30 shadow-sm cursor-pointer active:scale-[0.98]' : 'bg-slate-50 border-slate-100 opacity-90'}`}
                onClick={() => (isMissing || isRejected || isExpired) ? (type === 'LICENSE' ? handleStartVerification() : handleUploadClick(type)) : null}
            >
                {/* Status Bar */}
                <div className={`w-1 self-stretch rounded-full ${isVerified ? 'bg-green-500' : isPending ? 'bg-amber-500' : 'bg-brand-teal'}`}></div>

                {/* Icon */}
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${isVerified ? 'bg-green-50 text-green-600' : isPending ? 'bg-amber-50 text-amber-600' : 'bg-brand-teal text-white'}`}>
                    <Icon name={icon} className="text-xl" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{title}</h4>
                    <p className="text-[9px] text-slate-500">{sub}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] font-black uppercase ${isVerified ? 'text-green-600' : isPending ? 'text-amber-600' : 'text-brand-teal'}`}>
                            {status.replace('_', ' ')}
                        </span>
                        {doc?.expiryDate && <span className="text-[8px] text-slate-400">• Exp: {new Date(doc.expiryDate).toLocaleDateString()}</span>}
                    </div>
                </div>

                {/* Action */}
                {(isMissing || isRejected || isExpired) && (
                    <div className="bg-brand-teal/10 p-1.5 rounded-full">
                        {isUploading && uploadingType === type ? <span className="animate-spin material-symbols-rounded text-brand-teal text-lg">progress_activity</span> : <Icon name="add" className="text-brand-teal text-lg" />}
                    </div>
                )}
                {isVerified && <Icon name="check_circle" className="text-green-500 text-lg" />}
                {isPending && <Icon name="hourglass_top" className="text-amber-500 text-lg" />}
            </div>
        );
    };

    const completion = documents.filter(d => d.status === 'APPROVED').length / 3 * 100;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col font-sans animate-slide-up h-[100dvh] text-slate-900">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center bg-white/90 backdrop-blur-md px-4 py-2 pt-safe-top border-b border-slate-100 justify-between shrink-0 h-[52px]">
                <button onClick={onBack} className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Icon name="arrow_back_ios_new" className="text-slate-600 text-base" />
                </button>
                <h2 className="text-slate-900 text-xs font-bold leading-tight flex-1 text-center pr-8">Compliance Center</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                
                {/* Status Banner */}
                <div className={`rounded-2xl p-5 text-white flex items-center justify-between shadow-lg relative overflow-hidden ${completion === 100 ? 'bg-green-600' : 'bg-slate-900'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                         <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-1">Compliance Status</p>
                         <h2 className="text-2xl font-extrabold text-white leading-none tracking-tight">{Math.round(completion)}% Ready</h2>
                         <p className="text-[10px] text-white/90 mt-1.5 font-medium">{completion === 100 ? 'You are fully compliant!' : 'Action required to go online.'}</p>
                    </div>
                    <div className="relative size-12 flex items-center justify-center">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-black/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-white" strokeDasharray={`${completion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Documents List */}
                <div className="space-y-2">
                    <h3 className="text-slate-400 text-[9px] font-bold uppercase tracking-wider px-1">Mandatory Documents</h3>
                    
                    <DocItem 
                        type="LICENSE" 
                        title="Identity & License" 
                        sub="RSA ID + Driving License Card" 
                        icon="assignment_ind" 
                    />

                    {getStatus('LICENSE') !== 'MISSING' && (
                        <div className="px-3 pb-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Operating License No</label>
                            <input 
                                type="text"
                                value={operatingLicenseNo}
                                onChange={(e) => setOperatingLicenseNo(e.target.value)}
                                placeholder="e.g. OL-123456789"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-teal/20 outline-none"
                            />
                        </div>
                    )}
                    
                    <DocItem 
                        type="PRDP" 
                        title="PrDP Permit" 
                        sub="Professional Driving Permit" 
                        icon="verified_user" 
                    />

                    {getStatus('PRDP') !== 'MISSING' && (
                        <div className="px-3 pb-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">PrDP Expiry Date</label>
                            <input 
                                type="date"
                                value={prdpExpiry}
                                onChange={(e) => setPrdpExpiry(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-teal/20 outline-none"
                            />
                        </div>
                    )}

                    <DocItem 
                        type="VEHICLE_COF" 
                        title="Vehicle COF" 
                        sub="Certificate of Fitness" 
                        icon="directions_car" 
                    />
                </div>

                {/* Info Box */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <Icon name="info" className="text-blue-500 text-lg" />
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-blue-800 uppercase mb-0.5">Why is this required?</p>
                        <p className="text-[9px] text-blue-700 leading-tight">South African law (NLTA) requires all e-hailing partners to hold valid operating licenses and permits.</p>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
