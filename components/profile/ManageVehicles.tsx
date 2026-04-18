
import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../Icons';
import { Vehicle } from '../../types';
import { supabase } from '../../lib/supabase';
import { VehicleService } from '../../services/VehicleService';

interface ManageVehiclesProps {
    onBack: () => void;
}

export const ManageVehicles: React.FC<ManageVehiclesProps> = ({ onBack }) => {
    const { user, updateUserProfile } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifyingVehId, setIsVerifyingVehId] = useState<string | null>(null);

    // Form State (Stable hooks at the top level prevent typing glitches)
    const [vType, setVType] = useState<'Car' | 'Motorbike' | 'Truck'>('Car');
    const [vMake, setVMake] = useState('');
    const [vModel, setVModel] = useState('');
    const [vPlate, setVPlate] = useState('');
    const [vYear, setVYear] = useState('');
    const [vSeaters, setVSeaters] = useState(4);
    const [vOperatingLicense, setVOperatingLicense] = useState('');
    const [vDiscExpiry, setVDiscExpiry] = useState('');
    
    // Photo State
    const [photoExt, setPhotoExt] = useState<string | null>(null);
    const [photoInt, setPhotoInt] = useState<string | null>(null);
    
    const extInputRef = useRef<HTMLInputElement>(null);
    const intInputRef = useRef<HTMLInputElement>(null);

    const [fleet, setFleet] = useState<Vehicle[]>([]);

    const fetchFleet = async () => {
        if (!user) return;
        try {
            const data = await VehicleService.getDriverVehicles(user.id);
            setFleet(data);
        } catch (e) {
            console.error("Failed to fetch fleet", e);
        }
    };

    React.useEffect(() => {
        fetchFleet();
    }, [user?.id]);

    // Service Eligibility Logic
    const hasVerifiedCar = useMemo(() => fleet.some(v => v.type === 'Car' && v.status === 'VERIFIED'), [fleet]);
    const hasVerifiedBike = useMemo(() => fleet.some(v => v.type === 'Motorbike' && v.status === 'VERIFIED'), [fleet]);
    const hasVerifiedTruck = useMemo(() => fleet.some(v => v.type === 'Truck' && v.status === 'VERIFIED'), [fleet]);

    const activeService = user?.vehicleType || 'Car';

    const handleToggleService = async (target: 'Car' | 'Motorbike' | 'Truck') => {
        let isEligible = false;
        if (target === 'Car') isEligible = hasVerifiedCar;
        if (target === 'Motorbike') isEligible = hasVerifiedBike || hasVerifiedCar;
        if (target === 'Truck') isEligible = hasVerifiedTruck;

        if (!isEligible) {
            alert(`Verified ${target === 'Motorbike' ? 'Bike/Bicycle' : target} required. Please verify your License Disc first.`);
            return;
        }
        if (activeService !== target) {
            await updateUserProfile({ vehicle_type: target });
        }
    };

    const handleStartVehVerification = async (vehicleId: string) => {
        setIsVerifyingVehId(vehicleId);
        try {
            const { data, error } = await supabase.functions.invoke('start-kyc', {
                body: { type: 'VEHICLE_DISC', vehicleId }
            });

            if (error) throw error;
            if (data?.url) {
                const updatedFleet = fleet.map(v => v.id === vehicleId ? { ...v, status: 'IN_PROGRESS' as const } : v);
                await updateUserProfile({ fleet: updatedFleet });
                window.location.href = data.url;
            }
        } catch (e: any) {
            alert("Verification service busy. Try again now-now.");
        } finally {
            setIsVerifyingVehId(null);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'EXT' | 'INT') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    if (type === 'EXT') setPhotoExt(ev.target.result as string);
                    else setPhotoInt(ev.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !vMake || !vModel || !vPlate || !photoExt || !vDiscExpiry || !vOperatingLicense) {
            alert("Please fill in all mandatory fields, including License Disk and Operating License.");
            return;
        }
        setIsSaving(true);

        try {
            await VehicleService.addVehicle(user.id, {
                make: vMake,
                model: vModel,
                plate: vPlate.toUpperCase(),
                year: vYear,
                type: vType,
                disc_expiry: vDiscExpiry,
                operating_license_no: vOperatingLicense,
                license_disk_url: photoExt
            });
            
            await fetchFleet();
            setIsAdding(false);
            setVMake(''); setVModel(''); setVPlate(''); setVYear(''); 
            setVOperatingLicense(''); setVDiscExpiry('');
            setPhotoExt(null); setPhotoInt(null);
        } catch (err) {
            alert("Save failed. Check connection.");
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans animate-slide-up h-[100dvh]">
            
            {/* REGISTER VEHICLE MODAL - Ultra Compact Layout */}
            {isAdding && createPortal(
                <div 
                    onClick={() => setIsAdding(false)}
                    className="fixed inset-0 z-[10001] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 animate-fade-in"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-md rounded-t-3xl p-4 shadow-2xl animate-slide-up relative overflow-y-auto max-h-[95dvh] no-scrollbar"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Add Vehicle</h2>
                            <button onClick={() => setIsAdding(false)} className="size-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Icon name="close" /></button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="space-y-3">
                            {/* Compact Type Picker */}
                            <div className="grid grid-cols-3 gap-1.5">
                                {(['Car', 'Motorbike', 'Truck'] as const).map((type) => (
                                    <button
                                        key={type} type="button" onClick={() => setVType(type)}
                                        className={`flex items-center gap-2 py-2 px-3 rounded-xl border-2 transition-all ${vType === type ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        <Icon name={type === 'Car' ? 'directions_car' : type === 'Motorbike' ? 'directions_run' : 'local_shipping'} className="text-lg" />
                                        <span className="text-[9px] font-black uppercase">{type === 'Motorbike' ? 'Bike/Bicycle' : type}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Slim Photo Uploads */}
                            <div className="grid grid-cols-2 gap-2">
                                <div 
                                    onClick={() => extInputRef.current?.click()}
                                    className={`h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${photoExt ? 'border-brand-teal' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
                                >
                                    {photoExt ? <img src={photoExt} className="w-full h-full object-cover" /> : <><Icon name="add_a_photo" className="text-lg" /><span className="text-[8px] font-bold uppercase">Exterior</span></>}
                                    <input type="file" ref={extInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'EXT')} />
                                </div>
                                <div 
                                    onClick={() => intInputRef.current?.click()}
                                    className={`h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${photoInt ? 'border-brand-teal' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
                                >
                                    {photoInt ? <img src={photoInt} className="w-full h-full object-cover" /> : <><Icon name="add_a_photo" className="text-lg" /><span className="text-[8px] font-bold uppercase">Interior</span></>}
                                    <input type="file" ref={intInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'INT')} />
                                </div>
                            </div>

                            {/* Tight Input Grid */}
                            <div className="bg-slate-50 rounded-2xl p-2.5 space-y-2 border border-slate-100">
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={vMake} onChange={e => setVMake(e.target.value)} placeholder="Make" className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" required />
                                    <input value={vModel} onChange={e => setVModel(e.target.value)} placeholder="Model" className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={vPlate} onChange={e => setVPlate(e.target.value.toUpperCase())} placeholder="License Plate" className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" required />
                                    <input type="number" value={vYear} onChange={e => setVYear(e.target.value)} placeholder="Year" className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Disc Expiry</label>
                                        <input type="date" value={vDiscExpiry} onChange={e => setVDiscExpiry(e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Op. License No</label>
                                        <input value={vOperatingLicense} onChange={e => setVOperatingLicense(e.target.value)} placeholder="OL-12345" className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" required />
                                    </div>
                                </div>

                                {vType === 'Car' && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Seats:</span>
                                        <div className="flex gap-1.5">
                                            {[4, 5, 7].map(n => (
                                                <button 
                                                    key={n} type="button" onClick={() => setVSeaters(n)}
                                                    className={`px-3 py-1 rounded-full border text-[10px] font-black transition-all ${vSeaters === n ? 'border-brand-teal bg-brand-teal text-white' : 'border-slate-200 bg-white text-slate-400'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                disabled={isSaving || !photoExt} type="submit"
                                className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                            >
                                {isSaving ? <span className="animate-spin material-symbols-rounded">progress_activity</span> : 'Save Vehicle'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Main Fleet View - Compact & Scrol-less Optimized */}
            <div className="shrink-0 bg-white pt-safe-top border-b border-slate-50 h-[52px] flex items-center px-4">
                <button onClick={onBack} className="size-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                    <Icon name="arrow_back_ios_new" className="text-base" />
                </button>
                <h2 className="flex-1 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 pr-8">Fleet Management</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar pb-24">
                
                {/* My Garage Section - Slim Rows */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">My Garage</h3>
                        <button 
                            onClick={() => setIsAdding(true)} 
                            className="size-10 flex items-center justify-center text-brand-teal bg-brand-teal/5 rounded-full border border-brand-teal/20 active:scale-90 transition-all shadow-sm"
                            aria-label="Add Vehicle"
                        >
                            <Icon name="add" className="text-xl" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {fleet.length === 0 ? (
                            <div className="bg-slate-50 rounded-2xl py-6 border-2 border-dashed border-slate-100 flex flex-col items-center text-center gap-2">
                                <Icon name="directions_car" className="text-3xl text-slate-200" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">No Vehicles Linked</p>
                            </div>
                        ) : (
                            fleet.map((veh) => (
                                <div key={veh.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-50 shadow-inner">
                                            {veh.photos?.exterior ? <img src={veh.photos.exterior} className="w-full h-full object-cover" /> : <Icon name="directions_car" className="text-slate-300 p-2" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-xs font-black text-slate-800 truncate leading-none">{veh.make} {veh.model}</h4>
                                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                                                    veh.status === 'VERIFIED' ? 'bg-emerald-500 text-white' : 
                                                    veh.status === 'IN_PROGRESS' ? 'bg-amber-400 text-white animate-pulse' : 
                                                    'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {veh.status}
                                                </span>
                                            </div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{veh.plate} • {veh.year}</p>
                                        </div>
                                    </div>

                                    {veh.status === 'PENDING' ? (
                                        <button 
                                            disabled={isVerifyingVehId === veh.id}
                                            onClick={() => handleStartVehVerification(veh.id)}
                                            className="h-8 px-3 bg-brand-teal text-slate-900 rounded-lg font-black text-[8px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                                        >
                                            {isVerifyingVehId === veh.id ? <span className="animate-spin material-symbols-rounded">progress_activity</span> : <><Icon name="verified_user" className="text-[10px]" /> Verify</>}
                                        </button>
                                    ) : veh.status === 'VERIFIED' && (
                                        <div className="text-right">
                                            <p className="text-[7px] font-black text-emerald-600 uppercase">Expiry</p>
                                            <p className="text-[9px] font-black text-slate-700">{veh.disc_expiry ? new Date(veh.disc_expiry).toLocaleDateString() : 'Validated'}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Earning Modes Section - Compact Vertical List */}
                <div className="space-y-3">
                    <h3 className="text-slate-400 text-[9px] font-bold uppercase tracking-widest px-1">Earning Modes</h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-1.5 space-y-1">
                        {[
                            { id: 'Motorbike', label: 'Errands Runner', icon: 'directions_run', eligible: hasVerifiedBike || hasVerifiedCar },
                            { id: 'Truck', label: 'Move Requests', icon: 'local_shipping', eligible: hasVerifiedTruck }
                        ].map((mode) => (
                            <div 
                                key={mode.id}
                                onClick={() => handleToggleService(mode.id as any)}
                                className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${activeService === mode.id ? 'bg-white shadow-sm border border-slate-100' : 'opacity-50 grayscale'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-lg flex items-center justify-center ${activeService === mode.id ? 'bg-brand-teal text-slate-900 shadow-inner' : 'bg-slate-200 text-slate-400'}`}>
                                        <Icon name={mode.icon} className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 leading-none mb-0.5">{mode.label}</p>
                                        <p className={`text-[7px] font-bold uppercase tracking-wider ${mode.eligible ? 'text-brand-teal' : 'text-slate-400'}`}>
                                            {mode.eligible ? 'Ready to work' : 'Disc Scan Required'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${activeService === mode.id ? 'bg-brand-teal border-brand-teal text-white' : 'border-slate-200'}`}>
                                    {activeService === mode.id && <Icon name="check" className="text-[8px] font-black" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slim Safety Hint */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 mb-20">
                    <Icon name="info" className="text-blue-500 text-lg shrink-0 mt-0.5" />
                    <div>
                         <p className="text-[8px] text-blue-700 font-black uppercase mb-0.5">Verification Note</p>
                         <p className="text-[9px] text-blue-600/80 font-medium leading-tight">License Disc verification protects you and ensures your payouts are processed without delay.</p>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
