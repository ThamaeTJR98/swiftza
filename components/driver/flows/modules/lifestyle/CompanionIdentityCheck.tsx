import React from 'react';
import { Icon } from '../../../../Icons';

export const CompanionIdentityCheck: React.FC = () => {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-slate-50 font-sans animate-slide-up">
        {/* Header */}
        <div className="flex items-center bg-white p-4 border-b border-slate-200 justify-between">
            <div className="text-slate-900 flex size-12 shrink-0 items-center justify-start cursor-pointer">
                <Icon name="arrow_back" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Identity Check</h2>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-6 items-center">
            {/* Profile Section */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-40 w-40 border-4 border-blue-500/20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDU5Mg1WwDopQFhajyYxVJPI-mnF5RzKC75bVERlRNVnSfSlgk83LnZoHzyBIhULhiZ61sDWK3RXC4DHog2UmDFlu0M-6b7xAt_qVWxSsf9EXitmZ93XCfdC7GRgo5wtzg0umIUN9pt_z3FjQrIhYhxjZ7pVsenCz5D_I_uB7jDo4O63HMkM04IDD40H8kXq38eSMFkuRpCUTnuOxV-5vG0CRjbOKfkuq2Bf77kLdk7bVNjabZVk5YtU2YvnjfVr6W6lDv6yA0p_Csi')" }}></div>
                    <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-slate-50">
                        <Icon name="verified" className="text-sm" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-slate-900 text-2xl font-bold tracking-tight">Runner Identity</p>
                    <p className="text-blue-500 font-semibold text-sm uppercase tracking-wider">Verified Driver</p>
                </div>
            </div>

            {/* Verification Instructions */}
            <div className="bg-blue-500/5 rounded-xl p-6 mb-8 border border-blue-500/10 w-full max-w-md">
                <div className="flex items-start gap-4">
                    <Icon name="info" className="text-blue-500 mt-1" />
                    <div>
                        <h3 className="text-slate-900 text-lg font-bold leading-tight mb-2">Show this to passenger</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            For Companion Rides (Elderly/Kids), please present this screen to the passenger or their guardian for identity verification before starting the trip.
                        </p>
                    </div>
                </div>
            </div>

            {/* Safety Features */}
            <div className="w-full max-w-md space-y-4">
                <h4 className="text-slate-900 text-md font-bold uppercase tracking-widest text-xs px-1">Safety Controls</h4>
                
                {/* Audio Monitoring Toggle */}
                <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                            <Icon name="mic" />
                        </div>
                        <div>
                            <p className="text-slate-900 font-semibold">Audio Monitoring</p>
                            <p className="text-slate-500 text-xs">Recording for safety during trip</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100 opacity-80">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-lg text-red-500">
                            <Icon name="emergency" />
                        </div>
                        <div>
                            <p className="text-slate-900 font-semibold">Panic Button</p>
                            <p className="text-slate-500 text-xs">Notify dispatch immediately</p>
                        </div>
                    </div>
                    <Icon name="chevron_right" className="text-slate-400" />
                </div>
            </div>
        </main>
    </div>
  );
};
