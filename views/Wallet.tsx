import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType, PaymentMethod, UserRole } from '../types';
import { Button } from '../components/Button';
import { PaymentService } from '../services/PaymentService';

export const Wallet: React.FC = () => {
  const { user, updateUser } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    if (reference && user) {
        verifyPayment(reference);
    }
  }, [user]);

  const verifyPayment = async (reference: string) => {
    setIsProcessing(true);
    try {
        const result = await PaymentService.verifyTransaction(reference);
        if (result.status) {
            const amountPaid = result.amount;
            const newBalance = user!.wallet.balance + amountPaid;
            
            updateUser({
                wallet: {
                    ...user!.wallet,
                    balance: newBalance,
                    ledger: [
                        {
                            id: reference,
                            date: new Date().toISOString(),
                            description: 'Wallet Top Up (Paystack)',
                            amount: amountPaid,
                            type: TransactionType.ADJUSTMENT,
                            balanceAfter: newBalance
                        },
                        ...user!.wallet.ledger
                    ]
                }
            });
            alert(`Payment of R${amountPaid} verified successfully!`);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!user) return null;

  const { wallet } = user;
  const isDriver = user.role === UserRole.DRIVER;
  const isNegative = wallet.balance < 0;

  // Format currency
  const formatMoney = (amount: number) => {
    return `R ${Math.abs(amount).toFixed(2)}`;
  };

  const handleTopUp = async (customAmount?: number) => {
      const amount = customAmount || parseFloat(prompt("Enter amount to top up (R):", "100") || "0");
      if (!amount || amount <= 0 || !user?.email) return;

      setIsProcessing(true);
      try {
          const result = await PaymentService.initializeTransaction(user.email, amount, 'wallet_topup');
          if (result.authorization_url) {
              window.location.href = result.authorization_url;
          }
      } catch (e: any) {
          alert(e.message);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleClearDebt = () => {
      const amountToPay = Math.abs(wallet.balance);
      handleTopUp(amountToPay);
  };

  return (
    <div className="h-full bg-background-light p-6 pt-12 flex flex-col">
      <h1 className="text-2xl font-extrabold text-text-main mb-6">
          {isDriver ? 'Earnings & Commission' : 'My Wallet'}
      </h1>

      {/* Balance Card */}
      <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-8 transition-colors duration-500 ${isNegative ? 'bg-red-500' : 'bg-text-main'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <p className="text-white/80 text-sm font-medium mb-1">
            {isNegative ? 'Commission Owed to Platform' : 'Available Balance'}
        </p>
        <h2 className="text-4xl font-bold mb-6 flex items-center gap-2">
            {isNegative && '-'}{formatMoney(wallet.balance)}
        </h2>

        {isNegative && isDriver && (
             <div className="bg-red-700/50 p-3 rounded-lg text-xs mb-4 border border-red-400/30 flex items-start gap-2">
                 <span className="material-symbols-rounded text-base">warning</span>
                 <span>You have collected cash from riders. You owe 20% commission to SwiftZA.</span>
             </div>
        )}

        <div className="flex gap-3">
          {isNegative ? (
              <button 
                onClick={handleClearDebt}
                disabled={isProcessing}
                className="flex-1 bg-white text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm animate-pulse disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>
          ) : (
             <button 
                onClick={() => handleTopUp()}
                disabled={isProcessing}
                className="flex-1 bg-white text-text-main py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
             >
                {isProcessing ? 'Processing...' : 'Top Up'}
             </button>
          )}
          
          <button 
            disabled={!wallet.isPayoutEligible || isNegative}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors border ${wallet.isPayoutEligible && !isNegative ? 'bg-primary text-text-main border-primary hover:bg-[#20d87d]' : 'bg-transparent text-white/50 border-white/20'}`}
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-text-main">Recent Transactions</h3>
        <span className="text-xs text-gray-400 font-medium">Last 30 Days</span>
      </div>

      {wallet.ledger.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <span className="material-symbols-rounded text-4xl mb-2">receipt_long</span>
              <p>No transactions yet</p>
          </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 pb-20">
            {wallet.ledger.map((tx) => {
                const isCredit = tx.amount >= 0;
                let icon = 'payments';
                let colorClass = 'bg-gray-100 text-gray-600';

                if (tx.type === TransactionType.TRIP_EARNING) {
                    icon = 'local_taxi';
                    colorClass = 'bg-green-100 text-green-600';
                } else if (tx.type === TransactionType.COMMISSION_OWED) {
                    icon = 'percent';
                    colorClass = 'bg-orange-100 text-orange-600';
                } else if (tx.type === TransactionType.PAYOUT) {
                    icon = 'account_balance';
                    colorClass = 'bg-blue-100 text-blue-600';
                } else if (tx.type === TransactionType.ADJUSTMENT) {
                    icon = 'published_with_changes';
                    colorClass = 'bg-purple-100 text-purple-600';
                }

                return (
                    <div key={tx.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                            <span className="material-symbols-rounded text-xl">{icon}</span>
                        </div>
                        <div>
                            <p className="font-bold text-text-main text-sm">{tx.description}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                        </div>
                        <div className="text-right">
                             <span className={`font-bold block ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                                {isCredit ? '+' : '-'}{formatMoney(tx.amount)}
                            </span>
                            <span className="text-[10px] text-gray-400">Bal: {formatMoney(tx.balanceAfter)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};