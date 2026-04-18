
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankDetails as IBankDetails } from '../../types';
import { Icon } from '../Icons';

interface BankDetailsProps {
    onBack: () => void;
}

export const BankDetails: React.FC<BankDetailsProps> = ({ onBack }) => {
    const { user, updateUser } = useApp();
    const [details, setDetails] = useState<IBankDetails>(user?.bankDetails || {
        bankName: '',
        accountNumber: '',
        accountHolder: user?.name || '',
        branchCode: '',
        accountType: 'Savings'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!details.bankName || !details.accountNumber || !details.branchCode) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSaving(true);
        try {
            // In production, this would call an API to verify the bank details
            await updateUser({ bankDetails: details });
            alert("Bank details updated successfully!");
            onBack();
        } catch (e) {
            alert("Failed to save bank details.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full bg-white flex flex-col">
            <div className="px-4 pt-safe-top pb-4 border-b border-slate-100 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <Icon name="arrow_back" className="text-xl" />
                </button>
                <h2 className="text-lg font-bold text-slate-900">Bank Details</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Icon name="info" className="text-blue-500 mt-0.5 text-sm" />
                    <p className="text-[10px] text-blue-700 leading-tight">
                        Your earnings will be paid out to this account. Please ensure the details match your bank statement to avoid delays.
                    </p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Holder</label>
                        <input 
                            type="text"
                            value={details.accountHolder}
                            onChange={e => setDetails({...details, accountHolder: e.target.value})}
                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:border-brand-teal outline-none transition-all text-sm"
                            placeholder="Full Name"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Bank Name</label>
                        <select 
                            value={details.bankName}
                            onChange={e => setDetails({...details, bankName: e.target.value})}
                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:border-brand-teal outline-none transition-all appearance-none text-sm"
                        >
                            <option value="">Select Bank</option>
                            <option value="FNB">First National Bank (FNB)</option>
                            <option value="Standard Bank">Standard Bank</option>
                            <option value="Absa">Absa</option>
                            <option value="Nedbank">Nedbank</option>
                            <option value="Capitec">Capitec</option>
                            <option value="TymeBank">TymeBank</option>
                            <option value="Discovery Bank">Discovery Bank</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Type</label>
                            <select 
                                value={details.accountType}
                                onChange={e => setDetails({...details, accountType: e.target.value as any})}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:border-brand-teal outline-none transition-all appearance-none text-sm"
                            >
                                <option value="Savings">Savings</option>
                                <option value="Cheque">Cheque / Current</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Branch Code</label>
                            <input 
                                type="text"
                                value={details.branchCode}
                                onChange={e => setDetails({...details, branchCode: e.target.value})}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:border-brand-teal outline-none transition-all text-sm"
                                placeholder="6 digits"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Number</label>
                        <input 
                            type="text"
                            value={details.accountNumber}
                            onChange={e => setDetails({...details, accountNumber: e.target.value})}
                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:bg-white focus:border-brand-teal outline-none transition-all text-sm"
                            placeholder="Account Number"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 pb-28 border-t border-slate-50">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-base shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isSaving ? <span className="animate-spin material-symbols-rounded text-sm">progress_activity</span> : 'Save Bank Details'}
                </button>
            </div>
        </div>
    );
};
