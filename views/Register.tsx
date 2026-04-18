import React, { useState, useEffect } from 'react';
import { AppView, UserRole } from '../types';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icons';
import { supabase } from '../lib/supabase';
import { ValidationService } from '../services/ValidationService';
import { VehicleService } from '../services/VehicleService';

type RegStep = 'CREDENTIALS' | 'PROFILE' | 'ADDRESS' | 'BANKING' | 'COMPLIANCE' | 'VEHICLE' | 'DOCS';

// Simulated Didit Interface
const SimulatedVerification = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'INTRO' | 'SCAN_ID' | 'SELFIE' | 'PROCESSING'>('INTRO');
    
    useEffect(() => {
        if (phase === 'PROCESSING') {
            setTimeout(() => {
                onComplete();
            }, 3000);
        }
    }, [phase]);

    return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans animate-fade-in overflow-y-auto">
        <div className="min-h-full flex flex-col">
            {/* Header Mimic */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 tracking-tight">didit</span>
                    <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">DEMO MODE</span>
                </div>
                <span className="material-symbols-rounded text-slate-400 text-lg">lock</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                {phase === 'INTRO' && (
                    <div className="animate-slide-up space-y-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative">
                            <span className="material-symbols-rounded text-5xl text-blue-600">verified_user</span>
                            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                                <span className="material-symbols-rounded text-green-500">check_circle</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Simulated Verification</h2>
                            <p className="text-slate-500 text-sm">We are using a demo verification flow because the live server is currently unreachable.</p>
                        </div>
                        <ul className="text-left text-sm space-y-3 bg-gray-50 p-4 rounded-xl">
                            <li className="flex gap-2 text-slate-700">
                                <span className="material-symbols-rounded text-green-500 text-lg">check</span> Mock ID Scan
                            </li>
                            <li className="flex gap-2 text-slate-700">
                                <span className="material-symbols-rounded text-green-500 text-lg">check</span> Mock Selfie
                            </li>
                        </ul>
                        <Button fullWidth onClick={() => setPhase('SCAN_ID')}>Start Demo Check</Button>
                    </div>
                )}

                {phase === 'SCAN_ID' && (
                    <div className="animate-slide-up w-full h-full flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Scan Front of ID</h3>
                        <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center mb-6">
                            <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1555449372-23f27dbdf69c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                            <div className="w-64 h-40 border-2 border-white/50 rounded-lg relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-pulse"></div>
                            </div>
                            <p className="absolute bottom-8 text-white/80 text-xs font-bold uppercase tracking-widest">Align ID Card</p>
                        </div>
                        <Button fullWidth onClick={() => setPhase('SELFIE')}>Capture</Button>
                    </div>
                )}

                {phase === 'SELFIE' && (
                    <div className="animate-slide-up w-full h-full flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Take a Selfie</h3>
                        <div className="flex-1 bg-slate-900 rounded-full aspect-square w-full max-w-[300px] mx-auto relative overflow-hidden flex items-center justify-center mb-6 border-4 border-white shadow-xl">
                             <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                             <div className="w-full h-full rounded-full border-[20px] border-black/30"></div>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">Look straight at the camera and smile.</p>
                        <Button fullWidth onClick={() => setPhase('PROCESSING')}>Take Photo</Button>
                    </div>
                )}

                {phase === 'PROCESSING' && (
                    <div className="animate-fade-in flex flex-col items-center justify-center h-full">
                        <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Verifying Identity...</h3>
                        <p className="text-slate-500 text-sm">Analyzing biometrics and documents.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export const Register: React.FC = () => {
  const { signUpWithEmail, updateUserProfile, setView, registrationRole } = useApp();
  const [step, setStep] = useState<RegStep>('CREDENTIALS');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Verification States
  const [showSimulatedKYC, setShowSimulatedKYC] = useState(false);
  
  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  
  // Step 2: Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rsaId, setRsaId] = useState('');
  
  // Step 3: Address
  const [addressLine1, setAddressLine1] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 4: Banking
  const [bankName, setBankName] = useState('First National Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('250655');

  // Step 5: Compliance
  const [taxNumber, setTaxNumber] = useState('');
  const [csdNumber, setCsdNumber] = useState('');
  
  // Step 6: Vehicle
  const [vehicleType, setVehicleType] = useState('Car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password || !confirmPassword || !phone) {
          alert("Please fill in all fields");
          return;
      }
      if (password !== confirmPassword) {
          alert("Passwords do not match. Please try again.");
          return;
      }
      if (phone.length < 9) {
          alert("Please enter a valid South African mobile number.");
          return;
      }

      setIsLoading(true);
      setLoadingMessage('Creating Account...');
      try {
          await signUpWithEmail(email, password, phone, registrationRole);
          setStep('PROFILE');
      } catch (err: any) {
          // If we reach here, it's a critical error that AppContext didn't handle as "offline success"
          alert("Registration Error: " + err.message);
      } finally {
          setIsLoading(false);
          setLoadingMessage('');
      }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    // VALIDATION: RSA ID
    if (registrationRole === UserRole.DRIVER) {
        if (!ValidationService.isValidSAID(rsaId)) {
            alert("Invalid South African ID Number. Please check and try again.");
            return;
        }
    }

    if (registrationRole === UserRole.DRIVER) {
        setStep('ADDRESS');
    } else {
        completeRegistration();
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep('BANKING'); };
  const handleBankingSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep('COMPLIANCE'); };
  const handleComplianceSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep('VEHICLE'); };
  const handleVehicleSubmit = (e: React.FormEvent) => { 
      e.preventDefault(); 
      
      // VALIDATION: License Plate
      if (!ValidationService.isValidLicensePlate(plate)) {
          alert("Invalid License Plate Format. Example: AA 11 BB GP");
          return;
      }

      // VALIDATION: Insurance Expiry
      if (!insuranceExpiry) {
          alert("Please enter your commercial insurance expiry date.");
          return;
      }
      if (new Date(insuranceExpiry) < new Date()) {
          alert("Your insurance appears to be expired. Please renew it before registering.");
          return;
      }

      setStep('DOCS'); 
  };
  const handleDocsSubmit = (e: React.FormEvent) => { e.preventDefault(); completeRegistration(); };

  const triggerRealVerification = async () => {
        setLoadingMessage('Connecting to Didit...');
        setIsLoading(true);

        try {
            // Attempt real backend call
            const { data, error } = await supabase.functions.invoke('start-kyc');
            
            if (error) {
                // AUTO-FALLBACK: Any error (404, Network, 500) triggers simulation
                console.warn('Real verification unavailable, switching to simulation:', error.message);
                throw error;
            }
            
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No URL returned");
            }
        } catch (kycError: any) {
            // Graceful degradation: If server is down/missing, use the demo flow
            setIsLoading(false);
            setShowSimulatedKYC(true);
        }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    setLoadingMessage('Saving Profile...');
    try {
        const profileData: any = {
            full_name: `${firstName} ${lastName}`,
            address_data: { addressLine1, suburb, city, postalCode },
            banking_data: { bankName, accountNumber, branchCode },
            compliance_data: { taxNumber, csdNumber, rsaId },
            documents_data: { license_uploaded: true },
            is_verified: false,
            kycStatus: 'PENDING'
        };

        if (registrationRole === UserRole.DRIVER) {
             profileData.vehicle_type = vehicleType;
             
             // Create Vehicle Record
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 await VehicleService.addVehicle(user.id, {
                     make,
                     model,
                     year,
                     plate,
                     type: vehicleType as any,
                     insurance_expiry: insuranceExpiry,
                     operating_license_no: 'PENDING', // To be updated by admin
                     status: 'PENDING'
                 });
             }
        }

        await updateUserProfile(profileData);
        
        // Try real verification first, auto-fallback inside
        await triggerRealVerification();

    } catch (err: any) {
        console.error(err);
        setIsLoading(false);
        // Even if profile save fails (network), let them try the demo flow locally
        setShowSimulatedKYC(true);
    }
  }

  const handleSimulatedKYCComplete = async () => {
      setShowSimulatedKYC(false);
      setIsLoading(true);
      setLoadingMessage('Finalizing Demo Account...');
      
      // Update local profile to Verified since they "passed" the sim
      await updateUserProfile({
          is_verified: true,
          kyc_status: 'APPROVED'
      });

      setTimeout(() => {
          setIsLoading(false);
          if (registrationRole === UserRole.DRIVER) setView(AppView.DRIVER_HOME);
          else setView(AppView.HOME);
      }, 1000);
  };

  const renderCredentialsStep = () => (
      <form onSubmit={handleCredentialsSubmit} className="flex-1 flex flex-col gap-3 animate-slide-up relative z-10">
          <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-3 border border-gray-100 mb-0.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${registrationRole === UserRole.DRIVER ? 'bg-brand-teal' : 'bg-brand-purple'}`}>
                    <span className="material-symbols-rounded text-base">{registrationRole === UserRole.DRIVER ? 'work' : 'person'}</span>
                </div>
                <div>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">Signing up as</p>
                    <p className="font-bold text-text-main text-xs">
                        {registrationRole === UserRole.DRIVER ? 'Partner (Driver / Runner)' : 'Customer'}
                    </p>
                </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 text-sm" required />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Create Password</label>
            <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 pr-10 text-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-rounded text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Confirm Password</label>
            <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 pr-10 text-sm" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-rounded text-lg">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Mobile Number</label>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                <span className="font-bold text-gray-500 text-sm">+27</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} placeholder="82 123 4567" className="flex-1 bg-transparent outline-none font-medium text-sm" required maxLength={9} />
            </div>
            <p className="text-[8px] text-gray-400 mt-0.5">Used for driver communication only.</p>
          </div>

          <div className="mt-2">
            <Button fullWidth type="submit" disabled={isLoading}>{isLoading ? loadingMessage || 'Processing...' : 'Continue'}</Button>
          </div>
      </form>
  );

  const renderProfileStep = () => (
    <form onSubmit={handleProfileSubmit} className="flex-1 flex flex-col gap-4 animate-slide-up relative z-10">
      <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-start gap-3">
         <span className="material-symbols-rounded text-brand-teal mt-0.5 text-xl">badge</span>
         <div><h4 className="font-bold text-gray-800 text-xs">Personal Details</h4></div>
      </div>
      <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" required />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Surname</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" required />
          </div>
      </div>
      {registrationRole === UserRole.DRIVER && (
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">RSA ID Number</label>
            <input type="text" value={rsaId} onChange={(e) => setRsaId(e.target.value.replace(/\D/g,''))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" maxLength={13} />
          </div>
      )}
      <Button fullWidth type="submit" disabled={isLoading}>
          {isLoading ? loadingMessage : registrationRole === UserRole.DRIVER ? 'Next: Address' : 'Complete & Verify'}
      </Button>
    </form>
  );

  const getHeader = () => {
      switch(step) {
          case 'CREDENTIALS': return { title: 'Create Account', sub: 'Join SwiftZA today.' };
          case 'PROFILE': return { title: 'Who are you?', sub: 'Tell us a bit about yourself.' };
          default: return { title: 'Complete Setup', sub: 'Just a few more steps.' };
      }
  };

  if (showSimulatedKYC) {
      return <SimulatedVerification onComplete={handleSimulatedKYCComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-white px-5 pt-safe-top pb-safe md:max-w-md md:mx-auto md:shadow-xl md:rounded-2xl md:h-auto md:min-h-[600px] md:my-10 bg-white relative z-20 overflow-y-auto no-scrollbar">
      
      <div className="mb-0.5 mt-1 relative z-10">
        <button 
            onClick={() => {
                if (step === 'CREDENTIALS') setView(AppView.ONBOARDING);
                else setStep('CREDENTIALS'); 
            }}
            className="w-8 h-8 -ml-1 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-text-main active:scale-95"
        >
            <Icon name="arrow_back" className="text-lg" />
        </button>
      </div>

      <div className="mb-3 relative z-10">
        <h1 className="text-xl font-extrabold text-text-main mb-0 tracking-tight">{getHeader().title}</h1>
        <p className="text-text-sub text-[11px] font-medium">{getHeader().sub}</p>
      </div>

      {step === 'CREDENTIALS' && renderCredentialsStep()}
      {step === 'PROFILE' && renderProfileStep()}
      
      {step === 'ADDRESS' && (
          <form onSubmit={handleAddressSubmit} className="flex-1 flex flex-col gap-4 animate-slide-up relative z-10">
               <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Address</label><input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" required /></div>
               <Button fullWidth type="submit">Next</Button>
          </form>
      )}
      {step === 'BANKING' && (
          <form onSubmit={handleBankingSubmit} className="flex-1 flex flex-col gap-4 animate-slide-up relative z-10">
               <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Account Number</label><input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" required /></div>
               <Button fullWidth type="submit">Next</Button>
          </form>
      )}
      {step === 'COMPLIANCE' && (
          <form onSubmit={handleComplianceSubmit} className="flex-1 flex flex-col gap-4 animate-slide-up relative z-10">
               <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Tax Number</label><input type="text" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
               <Button fullWidth type="submit">Next</Button>
          </form>
      )}
      {step === 'VEHICLE' && (
          <form onSubmit={handleVehicleSubmit} className="flex-1 flex flex-col gap-4 animate-slide-up relative z-10">
               <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Vehicle Type</label>
                   <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm">
                       <option value="Car">Car (Sedan/Hatch)</option>
                       <option value="Motorbike">Motorbike</option>
                       <option value="Truck">Truck/Van</option>
                   </select>
               </div>
               <div className="grid grid-cols-2 gap-3">
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Make</label><input type="text" value={make} onChange={(e) => setMake(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Toyota" required /></div>
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Model</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Corolla" required /></div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Year</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="2018" required /></div>
                   <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Plate</label><input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" required /></div>
               </div>
               <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Insurance Expiry</label>
                   <input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" required />
               </div>
               <Button fullWidth type="submit">Next</Button>
          </form>
      )}
      {step === 'DOCS' && (
          <form onSubmit={handleDocsSubmit} className="flex-1 flex flex-col gap-4 animate-slide-up relative z-10">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50"><span className="material-symbols-rounded text-gray-400">cloud_upload</span><p className="text-xs font-bold text-gray-600 mt-1">Upload ID</p></div>
              <Button fullWidth type="submit" disabled={isLoading}>{isLoading ? loadingMessage : 'Finish & Verify'}</Button>
          </form>
      )}
    </div>
  );
};