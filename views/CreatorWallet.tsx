import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';
import { Icon } from '../components/Icons';

export const CreatorWallet: React.FC = () => {
  const { user, updateUser } = useApp();
  const [activeTab, setActiveTab] = useState<'CARDS' | 'PROMOS'>('CARDS');
  
  // Modals
  const [showTopUp, setShowTopUp] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [manageCardId, setManageCardId] = useState<string | null>(null);

  // Local Data State
  const [cards, setCards] = useState([
      { id: 'cash', type: 'CASH', last4: '', label: 'Cash', expiry: '', icon: 'payments', bg: 'bg-green-100', color: 'text-green-600', isDefault: true },
      { id: 'card_1', type: 'CARD', last4: '4242', label: 'Credit Card', expiry: '12/25', icon: 'credit_card', bg: 'bg-orange-100', color: 'text-orange-600', isDefault: false }
  ]);

  // Loyalty State
  const [punches, setPunches] = useState(() => {
      const saved = localStorage.getItem('swiftza_loyalty_punches');
      return saved ? parseInt(saved) : 4; // Start at 4 for demo purposes to show functionality easily
  });
  const punchCardTotal = 5;

  if (!user) return null;
  const { wallet } = user;

  const handleRedeemLoyalty = () => {
      if (punches < punchCardTotal) return;

      const rewardAmount = 30;
      updateUser({
          wallet: {
              ...wallet,
              balance: wallet.balance + rewardAmount,
              ledger: [
                  {
                      id: Date.now().toString(),
                      date: new Date().toISOString(),
                      description: 'Loyalty Reward Redeemed',
                      amount: rewardAmount,
                      type: TransactionType.ADJUSTMENT,
                      balanceAfter: wallet.balance + rewardAmount
                  },
                  ...wallet.ledger
              ]
          }
      });
      
      setPunches(0);
      localStorage.setItem('swiftza_loyalty_punches', '0');
      alert(`R${rewardAmount} credit added to your wallet!`);
  };

  const handleAddDebugPunch = () => {
      if (punches < punchCardTotal) {
          const newPunches = punches + 1;
          setPunches(newPunches);
          localStorage.setItem('swiftza_loyalty_punches', newPunches.toString());
      }
  };

  // --- TOP UP LOGIC ---
  const TopUpModal = () => {
      const [amount, setAmount] = useState('');
      const [isLoading, setIsLoading] = useState(false);

      const presets = [50, 100, 200, 500];

      const handleTopUp = () => {
          const val = parseFloat(amount);
          if (!val || val < 10) {
              alert("Minimum top up is R10");
              return;
          }

          setIsLoading(true);
          setTimeout(() => {
              updateUser({
                  wallet: {
                      ...wallet,
                      balance: wallet.balance + val,
                      ledger: [
                          { 
                              id: Date.now().toString(), 
                              date: new Date().toISOString(), 
                              description: 'Wallet Top Up', 
                              amount: val, 
                              type: TransactionType.ADJUSTMENT, 
                              balanceAfter: wallet.balance + val 
                          },
                          ...wallet.ledger
                      ]
                  }
              });
              setIsLoading(false);
              setShowTopUp(false);
              alert(`Successfully added R${val.toFixed(2)} to your wallet!`);
          }, 2000);
      };

      return createPortal(
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
              <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up shadow-2xl relative overflow-hidden">
                  <button onClick={() => setShowTopUp(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <Icon name="close" className="text-xl" />
                  </button>

                  <h2 className="text-xl font-extrabold text-slate-900 mb-6">Top Up Wallet</h2>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount</label>
                      <div className="flex items-center">
                          <span className="text-2xl font-black text-slate-400 mr-2">R</span>
                          <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              autoFocus
                              className="w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-8">
                      {presets.map(val => (
                          <button 
                              key={val}
                              onClick={() => setAmount(val.toString())}
                              className={`py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${amount === val.toString() ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                              R{val}
                          </button>
                      ))}
                  </div>

                  <button 
                      onClick={handleTopUp}
                      disabled={isLoading || !amount}
                      className="w-full h-14 bg-brand-teal text-white rounded-2xl font-black text-lg shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                      {isLoading ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : 'Confirm Top Up'}
                  </button>
              </div>
          </div>,
          document.body
      );
  };

  // --- ADD CARD LOGIC ---
  const AddCardModal = () => {
      const [cardNumber, setCardNumber] = useState('');
      const [expiry, setExpiry] = useState('');
      const [cvv, setCvv] = useState('');
      const [isLoading, setIsLoading] = useState(false);

      const handleSave = (e: React.FormEvent) => {
          e.preventDefault();
          setIsLoading(true);
          setTimeout(() => {
              const newCard = {
                  id: `card_${Date.now()}`,
                  type: 'CARD',
                  last4: cardNumber.slice(-4) || '8888',
                  label: 'New Card',
                  expiry: expiry || '12/28',
                  icon: 'credit_card',
                  bg: 'bg-slate-100',
                  color: 'text-slate-600',
                  isDefault: false
              };
              setCards([...cards, newCard]); // Add to local list
              setIsLoading(false);
              setShowAddCard(false);
          }, 1500);
      };

      return createPortal(
          <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-slide-up h-[100dvh]">
              <div className="flex items-center justify-between px-4 pt-safe-top pb-2 h-[60px] border-b border-slate-100">
                  <button onClick={() => setShowAddCard(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                      <Icon name="close" className="text-xl" />
                  </button>
                  <h2 className="font-extrabold text-slate-900">Add New Card</h2>
                  <div className="w-10"></div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl mb-8 relative overflow-hidden h-48 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                          <Icon name="credit_card" className="text-2xl text-white/50" />
                          <span className="font-mono text-sm opacity-50">BANK</span>
                      </div>
                      <div>
                          <p className="font-mono text-2xl tracking-widest mb-1">{cardNumber || '•••• •••• •••• ••••'}</p>
                          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider opacity-60">
                              <span>Exp: {expiry || 'MM/YY'}</span>
                              <span>CVV: {cvv ? '•••' : '•••'}</span>
                          </div>
                      </div>
                  </div>

                  <form id="card-form" onSubmit={handleSave} className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</label>
                          <div className="flex items-center gap-2">
                              <Icon name="credit_card" className="text-slate-400" />
                              <input type="tel" maxLength={19} placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))} className="bg-transparent flex-1 outline-none font-mono font-bold text-slate-900" required />
                          </div>
                      </div>
                      <div className="flex gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry</label>
                              <input type="text" maxLength={5} placeholder="MM/YY" value={expiry} onChange={e => { let v = e.target.value.replace(/\D/g,''); if(v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2); setExpiry(v); }} className="bg-transparent w-full outline-none font-mono font-bold text-slate-900" required />
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVV</label>
                              <input type="password" maxLength={3} placeholder="123" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,''))} className="bg-transparent w-full outline-none font-mono font-bold text-slate-900" required />
                          </div>
                      </div>
                  </form>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                      <Icon name="lock" className="text-sm" />
                      <span>Payments processed securely by PayStack</span>
                  </div>
              </div>
              <div className="p-6 border-t border-slate-100 pb-safe bg-white">
                  <button form="card-form" disabled={isLoading} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                      {isLoading ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : 'Save Card'}
                  </button>
              </div>
          </div>,
          document.body
      );
  };

  // --- MANAGE CARD MODAL ---
  // RENAMED: Changed from ManageCardSheet to ManageSheet to fix compilation error
  const ManageSheet = () => {
      const card = cards.find(c => c.id === manageCardId);
      if (!card) return null;

      const handleSetDefault = () => {
          setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === card.id })));
          setManageCardId(null);
      };

      const handleDelete = () => {
          if (confirm("Remove this payment method?")) {
              setCards(prev => prev.filter(c => c.id !== card.id));
              setManageCardId(null);
          }
      };

      return createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setManageCardId(null)}></div>
              <div className="bg-white relative z-10 rounded-t-3xl p-6 pb-safe animate-slide-up">
                  <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                          <Icon name={card.icon} className="text-2xl" />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900">{card.label} {card.last4 ? `•••• ${card.last4}` : ''}</h3>
                          <p className="text-xs text-slate-500">{card.isDefault ? 'Default Method' : 'Secondary Method'}</p>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      {!card.isDefault && (
                          <button onClick={handleSetDefault} className="w-full p-4 rounded-xl bg-slate-50 font-bold text-slate-700 flex items-center gap-3 hover:bg-slate-100">
                              <Icon name="check_circle" /> Set as Default
                          </button>
                      )}
                      {card.type !== 'CASH' && (
                          <button onClick={handleDelete} className="w-full p-4 rounded-xl bg-red-50 font-bold text-red-600 flex items-center gap-3 hover:bg-red-100">
                              <Icon name="delete" /> Remove Card
                          </button>
                      )}
                  </div>
                  <button onClick={() => setManageCardId(null)} className="w-full mt-4 py-3 font-bold text-slate-400">Cancel</button>
              </div>
          </div>,
          document.body
      );
  };

  return (
    <div className="h-full bg-white px-5 pt-safe-top pb-nav flex flex-col font-sans overflow-hidden">
      {showTopUp && <TopUpModal />}
      {showAddCard && <AddCardModal />}
      {manageCardId && <ManageSheet />}

      <h1 className="text-xl font-extrabold text-gray-900 mb-2 mt-4 shrink-0">My Wallet</h1>

      {/* Creator Balance Card - Functional Top Up */}
      <div className="bg-gradient-to-br from-brand-purple to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50 mb-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        
        <div className="flex justify-between items-start mb-1">
             <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">Current Balance</p>
        </div>
        
        <h2 className="text-3xl font-extrabold mb-4">R {wallet.balance.toFixed(2)}</h2>

        <button 
            onClick={() => setShowTopUp(true)}
            className="w-full bg-white text-indigo-600 h-10 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-50"
        >
            <span className="material-symbols-rounded text-lg">add_card</span>
            Top Up
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-4">
          <button 
            onClick={() => setActiveTab('CARDS')} 
            className={`flex-1 pb-2 text-sm font-bold transition-colors ${activeTab === 'CARDS' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-slate-400'}`}
          >
              Payment Methods
          </button>
          <button 
            onClick={() => setActiveTab('PROMOS')} 
            className={`flex-1 pb-2 text-sm font-bold transition-colors ${activeTab === 'PROMOS' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-slate-400'}`}
          >
              Loyalty & Promos
          </button>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          
          {activeTab === 'CARDS' && (
              <div>
                <div className="space-y-3">
                    {cards.map(card => (
                        <div key={card.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 shadow-sm bg-white transition-all hover:border-slate-200 group">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                                    <span className={`material-symbols-rounded ${card.color} text-xl`}>{card.icon}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-800 text-sm">{card.label} {card.last4 ? `•••• ${card.last4}` : ''}</p>
                                        {card.isDefault && <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 rounded">DEFAULT</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-400">{card.type === 'CASH' ? 'Pay directly' : `Expires ${card.expiry}`}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setManageCardId(card.id)} 
                                className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={() => setShowAddCard(true)}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-xs hover:border-brand-purple hover:text-brand-purple transition-all flex items-center justify-center gap-2"
                    >
                        <Icon name="add" className="text-base" />
                        Add New Card
                    </button>
                </div>
              </div>
          )}

          {activeTab === 'PROMOS' && (
              <div className="space-y-4">
                {/* Punch Card Promo */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Loyalty Pass</h3>
                                    <p className="text-[10px] text-slate-300">Complete 5 tasks to unlock R30 credit.</p>
                                </div>
                                {/* Debug Punch Button */}
                                <button onClick={handleAddDebugPunch} className="opacity-10 hover:opacity-50 text-white"><Icon name="add_circle" className="text-lg" /></button>
                            </div>
                            <div className="bg-brand-gold text-slate-900 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                Level 1
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                            {[...Array(punchCardTotal)].map((_, i) => {
                                const isCompleted = i < punches;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className={`w-full aspect-square rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-brand-teal border-brand-teal' : 'border-slate-600 bg-transparent'}`}>
                                            {isCompleted && <Icon name="check" className="text-white text-lg font-bold" />}
                                        </div>
                                        <span className={`text-[9px] font-bold ${isCompleted ? 'text-brand-teal' : 'text-slate-600'}`}>
                                            {i + 1}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10 text-center">
                            {punches >= punchCardTotal ? (
                                <button 
                                    onClick={handleRedeemLoyalty}
                                    className="w-full bg-brand-teal text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg"
                                >
                                    Redeem R30 Credit
                                </button>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    {punchCardTotal - punches} more tasks to unlock credit!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
              </div>
          )}
      </div>
    </div>
  );
};