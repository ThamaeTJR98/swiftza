
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icons';
import { useApp } from '../../context/AppContext';

interface PaymentMethodsProps {
    onBack: () => void;
}

interface PaymentMethodItem {
    id: string;
    type: 'CASH' | 'CARD' | 'PAYSTACK';
    label: string;
    subtext: string;
    icon: string;
    color: string;
    bg: string;
    isDefault?: boolean;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ onBack }) => {
    const { user } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [manageId, setManageId] = useState<string | null>(null);
    
    // --- Data State ---
    const [methods, setMethods] = useState<PaymentMethodItem[]>([
        { 
            id: 'cash', 
            type: 'CASH', 
            label: 'Cash', 
            subtext: 'Pay after your trip', 
            icon: 'payments', 
            color: 'text-green-600', 
            bg: 'bg-green-50', 
            isDefault: true 
        }
    ]);

    // Initialize with demo data if applicable
    useEffect(() => {
        if (user?.isDemo && methods.length === 1) {
            setMethods(prev => [
                ...prev,
                { id: 'card_demo_1', type: 'CARD', label: '•••• 5678', subtext: 'Credit/Debit Card (PayStack)', icon: 'credit_card', color: 'text-blue-600', bg: 'bg-blue-50' },
                { id: 'card_demo_2', type: 'CARD', label: '•••• 1234', subtext: 'Business Account', icon: 'credit_card', color: 'text-purple-600', bg: 'bg-purple-50' }
            ]);
        }
    }, [user?.isDemo]);

    // --- Actions ---
    const handleSetDefault = (id: string) => {
        setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
        setManageId(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to remove this payment method?")) {
            setMethods(prev => prev.filter(m => m.id !== id));
            setManageId(null);
        }
    };

    // --- FORM LOGIC ---
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSaveCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardNumber || cardNumber.length < 12 || !expiry || !cvv) {
            alert("Please enter valid card details");
            return;
        }

        setIsProcessing(true);

        setTimeout(() => {
            const newMethod: PaymentMethodItem = {
                id: `card_${Date.now()}`,
                type: 'CARD',
                label: `•••• ${cardNumber.slice(-4)}`,
                subtext: 'Credit/Debit Card',
                icon: 'credit_card',
                color: 'text-slate-600',
                bg: 'bg-slate-100'
            };

            setMethods(prev => [...prev, newMethod]);
            setIsProcessing(false);
            setIsAdding(false);
            setCardName(''); setCardNumber(''); setExpiry(''); setCvv('');
        }, 1500);
    };

    // --- MANAGE SHEET ---
    const ManageSheet = () => {
        const item = methods.find(m => m.id === manageId);
        if(!item) return null;

        return createPortal(
            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setManageId(null)}></div>
                <div className="bg-white relative z-10 w-full rounded-t-3xl p-6 pb-safe animate-slide-up">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                            <Icon name={item.icon} className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{item.label}</h3>
                            <p className="text-xs text-slate-500">{item.isDefault ? 'Current Default' : 'Secondary Method'}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {!item.isDefault && (
                            <button onClick={() => handleSetDefault(item.id)} className="w-full p-4 rounded-2xl bg-slate-50 font-bold text-slate-700 flex items-center gap-3 hover:bg-slate-100 active:scale-[0.98] transition-all">
                                <Icon name="check_circle" className="text-green-500 text-xl" /> Set as Default
                            </button>
                        )}
                        {item.type !== 'CASH' && (
                            <button onClick={() => handleDelete(item.id)} className="w-full p-4 rounded-2xl bg-red-50 font-bold text-red-600 flex items-center gap-3 hover:bg-red-100 active:scale-[0.98] transition-all">
                                <Icon name="delete" className="text-xl" /> Remove Method
                            </button>
                        )}
                    </div>
                    
                    <button onClick={() => setManageId(null)} className="w-full mt-4 py-3 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                </div>
            </div>,
            document.body
        );
    };

    // --- ADD CARD MODAL ---
    const AddCardModal = () => {
        return createPortal(
            <div className="fixed inset-0 z-[9999] flex flex-col bg-white font-sans animate-slide-up h-[100dvh]">
                <div className="flex items-center justify-between px-4 pt-safe-top pb-2 shrink-0 h-[60px]">
                    <button onClick={() => setIsAdding(false)} className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"><Icon name="close" className="text-xl" /></button>
                    <h2 className="text-slate-900 text-base font-extrabold uppercase tracking-wide">Add Card</h2>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-32">
                    <div className="relative w-full aspect-[1.586/1] bg-slate-900 rounded-2xl p-6 text-white shadow-2xl mb-8 overflow-hidden transform transition-transform hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
                        <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 mb-6 opacity-90 relative overflow-hidden border border-yellow-600/30">
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/20"></div>
                        </div>
                        <div className="mb-4"><p className="font-mono text-xl md:text-2xl tracking-widest drop-shadow-md">{cardNumber || '•••• •••• •••• ••••'}</p></div>
                        <div className="flex justify-between items-end">
                            <div><p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Card Holder</p><p className="font-bold text-xs md:text-sm tracking-wide uppercase truncate max-w-[150px]">{cardName || 'NAME SURNAME'}</p></div>
                            <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Expires</p><p className="font-bold text-xs md:text-sm tracking-wide font-mono">{expiry || 'MM/YY'}</p></div>
                        </div>
                    </div>

                    <form id="add-card-form" onSubmit={handleSaveCard} className="space-y-4">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <Icon name="credit_card" className="text-slate-400 text-lg" />
                            <input type="tel" maxLength={19} placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))} className="flex-1 bg-transparent outline-none font-mono text-sm font-bold text-slate-900" required />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 flex items-center focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                <input type="text" maxLength={5} placeholder="MM/YY" value={expiry} onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2); setExpiry(val); }} className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 text-center" required />
                            </div>
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 flex items-center focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                <input type="password" maxLength={3} placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 text-center" required />
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 flex items-center focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <Icon name="person" className="text-slate-400 text-lg mr-3" />
                            <input type="text" placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-900" required />
                        </div>
                    </form>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 pb-safe-action z-20">
                    <button type="submit" form="add-card-form" disabled={isProcessing} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-black disabled:opacity-70">
                        {isProcessing ? <span className="material-symbols-rounded animate-spin text-lg">progress_activity</span> : <><span>Save Securely</span><Icon name="check" className="text-lg" /></>}
                    </button>
                </div>
            </div>,
            document.body
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[#f6f8f6] font-sans animate-slide-up h-[100dvh] text-[#0d1b0d]">
            {isAdding && <AddCardModal />}
            {manageId && <ManageSheet />}
            
            <div className="shrink-0 flex items-center bg-[#f6f8f6]/95 backdrop-blur-md px-4 py-2 pt-safe-top justify-between border-b border-slate-200 h-[56px] z-20">
                <button onClick={onBack} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-700 transition-colors active:scale-90">
                    <Icon name="arrow_back_ios_new" className="text-lg" />
                </button>
                <h2 className="text-slate-900 text-sm font-bold uppercase tracking-wide flex-1 text-center pr-9">Payment Methods</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-40 md:pb-24">
                <div>
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-1">Saved Methods</h3>
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm divide-y divide-slate-50">
                        {methods.map((method) => (
                            <div key={method.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors group">
                                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${method.bg}`}>
                                    <Icon name={method.icon} className={`text-lg ${method.color}`} />
                                </div>
                                <div className="flex-1 min-w-0" onClick={() => !method.isDefault && handleSetDefault(method.id)}>
                                    <div className="flex items-center gap-2">
                                        <p className="text-slate-900 text-sm font-bold truncate">{method.label}</p>
                                        {method.isDefault && <span className="bg-primary/20 text-green-800 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Default</span>}
                                    </div>
                                    <p className="text-slate-500 text-[10px] truncate">{method.subtext}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setManageId(method.id); }}
                                    className="size-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-colors active:scale-90"
                                >
                                    <Icon name="more_vert" className="text-lg" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-32 md:bottom-10 left-0 right-0 px-6 z-30 pointer-events-none pb-safe-action">
                <button onClick={() => setIsAdding(true)} className="pointer-events-auto w-full bg-primary text-slate-900 rounded-xl h-12 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all">
                    <Icon name="add_card" className="text-lg" /><span>Add New Method</span>
                </button>
            </div>
        </div>,
        document.body
    );
};
