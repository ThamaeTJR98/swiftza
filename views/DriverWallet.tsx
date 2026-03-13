
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';
import { Icon } from '../components/Icons';

export const DriverWallet: React.FC = () => {
  const { user, updateUser } = useApp();
  const [showHistory, setShowHistory] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  if (!user) return null;

  const { wallet } = user;
  const isNegative = wallet.balance < 0;
  
  // SA Specific: Debt Limit before getting blocked
  const DEBT_LIMIT = -200;
  const amountUntilBlock = wallet.balance - DEBT_LIMIT;

  const formatMoney = (amount: number) => `R ${Math.abs(amount).toFixed(2)}`;

  // --- Dynamic Calculations ---
  const { totalEarned, totalTrips } = useMemo(() => {
      const trips = wallet.ledger.filter(t => t.type === TransactionType.TRIP_EARNING);
      const earned = trips.reduce((sum, t) => sum + t.amount, 0);
      return { 
          totalEarned: earned, 
          totalTrips: trips.length 
      };
  }, [wallet.ledger]);

  const handlePayDebt = () => {
      const amountToPay = Math.abs(wallet.balance);
      const confirm = window.confirm(`Pay R${amountToPay} via PayStack to clear your commission debt?`);
      
      if (confirm) {
          updateUser({
              wallet: {
                  ...wallet,
                  balance: 0,
                  ledger: [
                      { 
                          id: Date.now().toString(), 
                          date: new Date().toISOString(), 
                          description: 'Commission Settlement (PayStack)', 
                          amount: amountToPay, 
                          type: TransactionType.ADJUSTMENT, 
                          balanceAfter: 0 
                      },
                      ...wallet.ledger
                  ]
              }
          });
          alert("Debt cleared! You can now go online.");
      }
  };

  // --- PAYOUT MODAL ---
  const PayoutModal = () => {
      const [amount, setAmount] = useState(wallet.balance.toFixed(2));
      const [isProcessing, setIsProcessing] = useState(false);

      const handleConfirmPayout = () => {
          const val = parseFloat(amount);
          if (!val || val <= 0 || val > wallet.balance) {
              alert("Invalid amount");
              return;
          }

          setIsProcessing(true);
          setTimeout(() => {
              updateUser({
                  wallet: {
                      ...wallet,
                      balance: wallet.balance - val,
                      ledger: [
                          { 
                              id: Date.now().toString(), 
                              date: new Date().toISOString(), 
                              description: 'Payout Request', 
                              amount: -val, 
                              type: TransactionType.PAYOUT, 
                              balanceAfter: wallet.balance - val 
                          },
                          ...wallet.ledger
                      ]
                  }
              });
              setIsProcessing(false);
              setShowPayoutModal(false);
              alert("Payout request submitted successfully. Funds will reflect in 24-48 hours.");
          }, 1500);
      };

      return createPortal(
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
              <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up shadow-2xl relative">
                  <button onClick={() => setShowPayoutModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <Icon name="close" className="text-xl" />
                  </button>

                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">Request Payout</h2>
                  <p className="text-sm text-slate-500 mb-6">Transfer earnings to your bank account.</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bank Account</label>
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">FNB</div>
                          <div>
                              <p className="font-bold text-slate-900 text-sm">•••• 4567</p>
                              <p className="text-[10px] text-slate-500">Savings Account</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20 transition-all">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount to Withdraw</label>
                      <div className="flex items-center">
                          <span className="text-2xl font-black text-slate-400 mr-2">R</span>
                          <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-transparent text-3xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                          />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Available: R {wallet.balance.toFixed(2)}</p>
                  </div>

                  <button 
                      onClick={handleConfirmPayout}
                      disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                      {isProcessing ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : 'Confirm Transfer'}
                  </button>
              </div>
          </div>,
          document.body
      );
  };

  const renderHistoryItem = (tx: any) => {
      const isEarning = tx.type === TransactionType.TRIP_EARNING;
      const isCommission = tx.type === TransactionType.COMMISSION_OWED;
      const isPayout = tx.type === TransactionType.PAYOUT;
      
      return (
        <div key={tx.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-2 last:mb-0">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isEarning ? 'bg-green-100 text-green-600' : isCommission ? 'bg-orange-100 text-orange-600' : isPayout ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    <span className="material-symbols-rounded text-base">
                        {isEarning ? 'add' : isCommission ? 'remove' : isPayout ? 'arrow_outward' : 'sync'}
                    </span>
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-xs">{tx.description}</p>
                    <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            </div>
            <span className={`font-bold text-xs ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {tx.amount >= 0 ? '+' : ''}R{Math.abs(tx.amount).toFixed(2)}
            </span>
        </div>
      );
  };

  // --- FULL HISTORY VIEW ---
  if (showHistory) {
      return (
          <div className="h-full bg-gray-50 flex flex-col pt-safe-top animate-slide-up z-50 absolute inset-0">
              <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-100 shadow-sm shrink-0">
                  <button onClick={() => setShowHistory(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                      <span className="material-symbols-rounded text-gray-600">arrow_back</span>
                  </button>
                  <h1 className="text-lg font-bold text-gray-900">Transaction History</h1>
              </div>
              <div className="flex-1 overflow-y-auto p-4 pb-safe">
                   {wallet.ledger.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="material-symbols-rounded text-4xl mb-2 opacity-20">receipt_long</span>
                            <p className="text-sm">No transactions yet</p>
                        </div>
                   ) : (
                        wallet.ledger.map(renderHistoryItem)
                   )}
              </div>
          </div>
      );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="h-full bg-gray-50 flex flex-col font-sans overflow-hidden">
      {showPayoutModal && <PayoutModal />}
      
      {/* Header */}
      <div className="px-6 pt-safe-top pb-2 bg-white z-10 shrink-0 border-b border-gray-50">
           <h1 className="text-lg font-extrabold text-gray-900">Earnings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-nav no-scrollbar space-y-4">
        
        {/* Balance Card */}
        <div className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transition-colors duration-500 ${isNegative ? 'bg-red-600' : 'bg-gray-900'}`}>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                            {isNegative ? 'Commission Owed (Debt)' : 'Withdrawable Balance'}
                        </p>
                        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-1">
                            {isNegative && <span className="opacity-80">-</span>}
                            {formatMoney(wallet.balance)}
                        </h2>
                    </div>
                </div>
                
                {isNegative ? (
                    <div className="mt-3 mb-4">
                        <div className="flex items-center gap-1.5 text-yellow-300 mb-1">
                            <span className="material-symbols-rounded text-sm">warning</span>
                            <span className="font-bold text-xs">Limit: -R200.00</span>
                        </div>
                        <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                             <div className="h-full bg-yellow-400" style={{ width: `${Math.min(100, (Math.abs(wallet.balance) / 200) * 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] text-white/80 mt-1 leading-tight">
                            You collected cash trips. This negative balance will be deducted from your next digital trip earnings automatically.
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 mt-1 mb-4">Payouts processed every Tuesday.</p>
                )}

                <div className="flex gap-2">
                    {isNegative ? (
                        <button 
                            onClick={handlePayDebt}
                            className="flex-1 bg-white text-red-600 h-10 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-rounded text-base">credit_card</span>
                            Settle Now
                        </button>
                    ) : (
                        <button 
                            onClick={() => setShowPayoutModal(true)}
                            disabled={wallet.balance <= 0}
                            className={`flex-1 h-10 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-colors ${wallet.balance > 0 ? 'bg-brand-teal border-brand-teal text-white shadow-lg active:scale-95' : 'border-white/20 text-white/50 cursor-not-allowed'}`}
                        >
                            Request Payout
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Functional Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-1">
                    <span className="material-symbols-rounded text-lg">payments</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Earned</p>
                <p className="text-lg font-bold text-gray-900">R {totalEarned.toFixed(0)}</p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                    <span className="material-symbols-rounded text-lg">local_taxi</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Trips Completed</p>
                <p className="text-lg font-bold text-gray-900">{totalTrips}</p>
            </div>
        </div>

        {/* Recent History Preview */}
        <div>
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-bold text-sm text-gray-900">Recent Activity</h3>
                <button onClick={() => setShowHistory(true)} className="text-brand-teal text-xs font-bold">View All</button>
            </div>
            
            <div className="space-y-2">
                {wallet.ledger.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border border-gray-100 border-dashed">
                        <p className="text-xs text-gray-400">No transactions yet</p>
                    </div>
                ) : (
                    wallet.ledger.slice(0, 4).map(renderHistoryItem)
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
