import React, { useState } from 'react';
import { RideRequest, RideStatus, ErrandCategory } from '../../../types';
import { ShoppingStateMachine } from './machines/ShoppingStateMachine';
import { DeliveryStateMachine } from './machines/DeliveryStateMachine';
import { QueueingStateMachine } from './machines/QueueingStateMachine';
import { HouseholdStateMachine } from './machines/HouseholdStateMachine';
import { LifestyleStateMachine } from './machines/LifestyleStateMachine';
import { BusinessStateMachine } from './machines/BusinessStateMachine';

interface ErrandFlowControllerProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

/**
 * The "Brain" of the Errand Flow.
 * This component looks at the errand category and delegates the UI 
 * to the appropriate State Machine, which then stitches together the modular screens.
 */
export const ErrandFlowController: React.FC<ErrandFlowControllerProps> = ({ ride, onStatusUpdate }) => {
  const category = ride.errandDetails?.category as ErrandCategory;

  // 1. SHOPPING
  if ([ErrandCategory.GROCERY_SHOPPING, ErrandCategory.PERSONAL_SHOPPING].includes(category)) {
    return <ShoppingStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // 2. DELIVERY
  if ([ErrandCategory.PACKAGE_DELIVERY, ErrandCategory.DOCUMENT_DELIVERY].includes(category)) {
    return <DeliveryStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // 3. QUEUEING
  if ([ErrandCategory.GOVT_QUEUE, ErrandCategory.BANK_QUEUE].includes(category)) {
    return <QueueingStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // 4. HOUSEHOLD
  if ([ErrandCategory.HEAVY_LIFTING, ErrandCategory.FURNITURE_MOVE, ErrandCategory.APARTMENT_MOVE].includes(category)) {
    return <HouseholdStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // 5. LIFESTYLE
  if ([ErrandCategory.ELDERLY_SUPPORT, ErrandCategory.PET_CARE].includes(category)) {
    return <LifestyleStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // 6. BUSINESS
  if ([ErrandCategory.OFFICE_ADMIN, ErrandCategory.FORM_SUBMISSION].includes(category)) {
    return <BusinessStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // Fallback
  return <div className="p-4 text-center">Generic Errand State Machine</div>;
};
