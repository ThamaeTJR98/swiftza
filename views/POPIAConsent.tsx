
import React from 'react';
import { AppView, UserRole } from '../types';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';

export const POPIAConsent: React.FC = () => {
    const { setView, registrationRole } = useApp();

    const handleAccept = () => {
        // In a real app, we would log this consent timestamp
        if (registrationRole) {
            setView(AppView.REGISTER);
        } else {
            // Default to login if no role flow active
            setView(AppView.LOGIN);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background-light p-6 pt-safe-top md:max-w-md md:mx-auto md:shadow-xl md:rounded-2xl md:h-auto md:min-h-[600px] md:my-10 bg-white relative z-20">
            <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <span className="material-icons-round text-4xl">security</span>
                </div>
                
                <h1 className="text-2xl font-extrabold text-text-main mb-2">Data Privacy</h1>
                <p className="text-text-sub text-sm mb-8">Before we continue, please review how we use your data.</p>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left shadow-sm mb-6 w-full max-h-[400px] overflow-y-auto">
                    <h3 className="font-bold text-gray-800 mb-2">POPIA Compliance</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        In accordance with the Protection of Personal Information Act (POPIA) of South Africa, we are committed to protecting your personal data.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="material-icons-round text-brand-purple text-lg mt-0.5">my_location</span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700">Location Tracking</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">We collect your precise location to match you with nearby runners and track deliveries in real-time.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="material-icons-round text-brand-teal text-lg mt-0.5">badge</span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700">Identity Verification</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">We process your ID and documents to ensure safety for all platform users.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <span className="material-icons-round text-blue-500 text-lg mt-0.5">share</span>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700">Sharing with 3rd Parties</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">We only share data with drivers/runners fulfilling your request and safety partners in emergencies.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto w-full">
                    <Button fullWidth onClick={handleAccept}>
                        Agree & Continue
                    </Button>
                    <button 
                        onClick={() => setView(AppView.ONBOARDING)}
                        className="w-full py-3 text-xs font-bold text-gray-400 mt-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
