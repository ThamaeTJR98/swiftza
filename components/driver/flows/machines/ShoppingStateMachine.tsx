import React, { useState } from 'react';
import { RideRequest, RideStatus, ErrandItem } from '../../../../types';
import { RunnerNavToStore } from '../modules/shopping/RunnerNavToStore';
import { RunnerArrivedAtStore } from '../modules/shopping/RunnerArrivedAtStore';
import { RunnerShoppingChecklist } from '../modules/shopping/RunnerShoppingChecklist';
import { RunnerSubstituteModal } from '../modules/shopping/RunnerSubstituteModal';
import { RunnerActiveQueueTimer } from '../modules/queueing/RunnerActiveQueueTimer';
import { RunnerQueuePrompt } from '../modules/queueing/RunnerQueuePrompt';
import { RunnerLiveBudgetOverview } from '../modules/shopping/RunnerLiveBudgetOverview';
import { RunnerMessages, Message } from '../modules/shopping/RunnerMessages';
import { RunnerVirtualCardCheckout } from '../modules/shopping/RunnerVirtualCardCheckout';
import { HandoverQrPinShare } from '../modules/shared/HandoverQrPinShare';
import { RunnerNavToDropoff } from '../modules/delivery/RunnerNavToDropoff';
import { RunnerBudgetIncreaseRequest } from '../modules/shopping/RunnerBudgetIncreaseRequest';
import { RunnerWaitingForApproval } from '../modules/shopping/RunnerWaitingForApproval';
import { CustomerBudgetApprovalModal } from '../modules/shopping/CustomerBudgetApprovalModal';
import { RunnerBudgetApprovalReceived } from '../modules/shopping/RunnerBudgetApprovalReceived';
import { RunnerReceiptUpload } from '../modules/shopping/RunnerReceiptUpload';

interface Props {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type ShoppingState = 
  | 'NAV_TO_STORE' 
  | 'ARRIVED_AT_STORE' 
  | 'SHOPPING' 
  | 'LIVE_BUDGET_OVERVIEW'
  | 'MESSAGES'
  | 'QUEUE_CHECK'
  | 'QUEUEING' 
  | 'CHECKOUT' 
  | 'RECEIPT_UPLOAD'
  | 'NAV_TO_DROPOFF' 
  | 'HANDOVER'
  | 'BUDGET_INCREASE_REQUEST'
  | 'WAITING_FOR_APPROVAL'
  | 'BUDGET_APPROVAL_RECEIVED';

export const ShoppingStateMachine: React.FC<Props> = ({ ride, onStatusUpdate }) => {
  const [currentState, setCurrentState] = useState<ShoppingState>('NAV_TO_STORE');
  const [items, setItems] = useState<ErrandItem[]>(ride.errandDetails?.items || []);
  const [substituteItem, setSubstituteItem] = useState<ErrandItem | null>(null);
  const [queueStartTime, setQueueStartTime] = useState<number>(0);
  const [checkoutStartTime, setCheckoutStartTime] = useState<number>(0);
  const [increaseReason, setIncreaseReason] = useState<string>('');
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [approvedBudgetIncrease, setApprovedBudgetIncrease] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([
      { id: '1', text: 'Hi! I am at the store now. Starting to pick your items.', sender: 'me', timestamp: '10:05 AM' },
      { id: '2', text: 'Great, thank you! Please let me know if they don\'t have the salmon.', sender: 'customer', timestamp: '10:06 AM' }
  ]);

  const currentStop = ride.stops?.[ride.currentStopIndex || 0] || {
    id: 'store', type: 'SHOPPING', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING', customerName: 'Store'
  };

  const handleUpdateItem = (id: string, updates: Partial<ErrandItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates } 
        : item
    ));
  };

  const handleConfirmSubstitute = (subName: string, subPrice: number) => {
    if (!substituteItem) return;
    setItems(prev => prev.map(item => 
      item.id === substituteItem.id 
        ? { ...item, status: 'SUBSTITUTED', name: `${item.name} (Sub: ${subName})`, estimatedPrice: subPrice } 
        : item
    ));
    setSubstituteItem(null);
  };

  const handleSendMessage = (text: string) => {
      const newMessage: Message = {
          id: Date.now().toString(),
          text,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
  };

  const baseOriginalTotal = ride.errandDetails?.items?.reduce((acc, curr) => {
      const qty = parseInt(curr.quantity) || 1;
      return acc + ((curr.estimatedPrice || 0) * qty);
  }, 0) || 0;

  const originalTotal = baseOriginalTotal + approvedBudgetIncrease;

  const actualTotal = items.reduce((acc, curr) => {
      if (curr.status !== 'FOUND' && curr.status !== 'SUBSTITUTED') return acc;
      const qty = parseInt(curr.quantity) || 1;
      return acc + ((curr.actualPrice !== undefined ? curr.actualPrice : (curr.estimatedPrice || 0)) * qty);
  }, 0);

  // --- STATE MACHINE ROUTING ---

  if (currentState === 'NAV_TO_STORE') {
    return (
      <RunnerNavToStore 
        currentStop={currentStop}
        items={items}
        onArrive={() => setCurrentState('ARRIVED_AT_STORE')} 
        onBack={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'ARRIVED_AT_STORE') {
    return (
      <RunnerArrivedAtStore 
        currentStop={currentStop} 
        items={items} 
        onStartShopping={() => setCurrentState('SHOPPING')} 
        onBack={() => setCurrentState('NAV_TO_STORE')}
      />
    );
  }

  if (currentState === 'SHOPPING') {
    return (
      <>
        <RunnerShoppingChecklist 
          items={items} 
          onUpdateItem={handleUpdateItem} 
          onSubstitute={(item) => setSubstituteItem(item)} 
          onStartQueue={() => {
              setQueueStartTime(Date.now());
              setCurrentState('QUEUEING');
          }}
          onCheckout={() => {
            setCurrentState('LIVE_BUDGET_OVERVIEW');
          }}
          onMessages={() => setCurrentState('MESSAGES')}
          onBack={() => setCurrentState('ARRIVED_AT_STORE')}
          onMenu={() => {}}
        />
        
        {substituteItem && (
          <RunnerSubstituteModal 
            item={substituteItem} 
            onConfirm={handleConfirmSubstitute} 
            onCancel={() => setSubstituteItem(null)} 
          />
        )}
      </>
    );
  }

  if (currentState === 'LIVE_BUDGET_OVERVIEW') {
    return (
      <RunnerLiveBudgetOverview 
        originalTotal={originalTotal}
        actualTotal={actualTotal}
        onRequestIncrease={() => setCurrentState('BUDGET_INCREASE_REQUEST')}
        onProceedToQueue={() => setCurrentState('QUEUE_CHECK')}
        onBackToChecklist={() => setCurrentState('SHOPPING')}
        onMessages={() => setCurrentState('MESSAGES')}
      />
    );
  }

  if (currentState === 'MESSAGES') {
    return (
      <RunnerMessages 
        customerName={ride.errandDetails?.recipientName || 'Customer'}
        messages={messages}
        onSendMessage={handleSendMessage}
        onBackToChecklist={() => setCurrentState('SHOPPING')}
        onGoToBudget={() => setCurrentState('LIVE_BUDGET_OVERVIEW')}
      />
    );
  }

  if (currentState === 'QUEUE_CHECK') {
    return (
      <RunnerQueuePrompt 
        onYes={() => {
          setQueueStartTime(Date.now());
          setCurrentState('QUEUEING');
        }}
        onNo={() => setCurrentState('CHECKOUT')}
      />
    );
  }

  if (currentState === 'QUEUEING') {
    return (
      <RunnerActiveQueueTimer 
        startTime={queueStartTime} 
        baseRatePerMin={2.50} 
        onFinishQueue={() => setCurrentState('CHECKOUT')} 
        onAbandonQueue={() => onStatusUpdate(RideStatus.CANCELLED)}
        ride={ride}
      />
    );
  }

  if (currentState === 'BUDGET_INCREASE_REQUEST') {
    return (
      <RunnerBudgetIncreaseRequest 
        originalTotal={originalTotal}
        newTotal={actualTotal}
        items={items}
        onRequest={(reason) => {
            setIncreaseReason(reason);
            setCurrentState('WAITING_FOR_APPROVAL');
            
            // TODO (Production): Replace this simulation with a real WebSocket/API call.
            // In a production environment, this would emit an event to the backend:
            // socket.emit('request_budget_increase', { rideId: ride.id, reason, newTotal: actualTotal });
            // The Runner app would then wait for a 'budget_increase_response' event from the server.
            
            // --- SIMULATION FOR PREVIEW ---
            // Simulating the customer receiving the push notification and opening the modal
            setTimeout(() => setShowCustomerModal(true), 2000);
        }}
        onCancel={() => setCurrentState('SHOPPING')}
      />
    );
  }

  if (currentState === 'WAITING_FOR_APPROVAL') {
    return (
      <>
        <RunnerWaitingForApproval 
          originalTotal={originalTotal}
          newTotal={actualTotal}
          onCancelRequest={() => {
              setShowCustomerModal(false);
              setCurrentState('SHOPPING');
          }}
        />
        {showCustomerModal && (
            <CustomerBudgetApprovalModal 
                originalTotal={originalTotal}
                newTotal={actualTotal}
                reason={increaseReason}
                onApprove={() => {
                    setShowCustomerModal(false);
                    setApprovedBudgetIncrease(actualTotal - baseOriginalTotal);
                    setCurrentState('BUDGET_APPROVAL_RECEIVED');
                }}
                onDecline={() => {
                    setShowCustomerModal(false);
                    // If declined, go back to shopping to remove items
                    setCurrentState('SHOPPING');
                    // Add a message from customer
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: "I can't approve the increase. Please remove some items to stay within budget.",
                        sender: 'customer',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, newMessage]);
                }}
            />
        )}
      </>
    );
  }

  if (currentState === 'BUDGET_APPROVAL_RECEIVED') {
    // We want to show the difference between what was requested and what was previously approved.
    // Since we just updated approvedBudgetIncrease to (actualTotal - baseOriginalTotal),
    // the increase amount is the difference between actualTotal and the old originalTotal.
    // But we don't have the old originalTotal stored. 
    // We can just pass the actualTotal and the baseOriginalTotal, and let the component calculate it.
    // Wait, the component does `increaseAmount = newTotal - originalTotal`.
    // If we pass `baseOriginalTotal` as `originalTotal`, it will show the *total* increase from the very beginning.
    // Let's just pass `baseOriginalTotal` so it shows the total increase.
    return (
      <RunnerBudgetApprovalReceived 
        originalTotal={baseOriginalTotal}
        newTotal={actualTotal}
        onProceed={() => setCurrentState('QUEUE_CHECK')}
      />
    );
  }

  if (currentState === 'CHECKOUT') {
    if (checkoutStartTime === 0) setCheckoutStartTime(Date.now());
    return (
      <RunnerVirtualCardCheckout 
        amount={actualTotal} 
        startTime={checkoutStartTime || Date.now()}
        status="ACTIVE"
        merchantName={currentStop.customerName || 'Merchant'}
        itemsCount={items.length}
        onPaymentComplete={() => setCurrentState('RECEIPT_UPLOAD')} 
        onCancel={() => setCurrentState('SHOPPING')}
      />
    );
  }

  if (currentState === 'RECEIPT_UPLOAD') {
    return (
      <RunnerReceiptUpload 
        onUpload={() => setCurrentState('NAV_TO_DROPOFF')}
        onCancel={() => setCurrentState('CHECKOUT')}
      />
    );
  }

  if (currentState === 'NAV_TO_DROPOFF') {
    return (
      <RunnerNavToDropoff 
        currentStop={{ ...currentStop, address: ride.dropoff.address, customerName: ride.errandDetails?.recipientName || 'Customer' }} 
        onArrive={() => setCurrentState('HANDOVER')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'HANDOVER') {
    return (
      <HandoverQrPinShare 
        ride={ride}
        onVerify={() => onStatusUpdate(RideStatus.COMPLETED)}
      />
    );
  }

  return null;
};
