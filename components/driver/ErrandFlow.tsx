
import React from 'react';
import { RideRequest, RideStatus, ErrandCategory } from '../../types';
import { ErrandFlowController } from './flows/ErrandFlowController';
import { PickupErrandFlow } from './flows/PickupErrandFlow';
import { QueueingStateMachine } from './flows/machines/QueueingStateMachine';
import { MoverFlow } from './flows/MoverFlow';

interface ErrandFlowProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

export const ErrandFlow: React.FC<ErrandFlowProps> = ({ ride, onStatusUpdate }) => {
  const category = ride.errandDetails?.category;

  const isQueueTask = [
      ErrandCategory.GOVT_QUEUE, 
      ErrandCategory.BANK_QUEUE, 
      ErrandCategory.FORM_SUBMISSION
  ].includes(category as ErrandCategory);

  const isPickupTask = [
      ErrandCategory.PACKAGE_DELIVERY,
      ErrandCategory.DOCUMENT_DELIVERY,
      ErrandCategory.OFFICE_ADMIN,
      ErrandCategory.INTER_OFFICE_COURIER,
      ErrandCategory.SMALL_BIZ_LOGISTICS,
      ErrandCategory.LAUNDRY,
      ErrandCategory.ELDERLY_SUPPORT,
      ErrandCategory.SCHOOL_RUN
  ].includes(category as ErrandCategory);

  const isMoverTask = [
      ErrandCategory.HEAVY_LIFTING,
      ErrandCategory.FURNITURE_MOVE,
      ErrandCategory.APARTMENT_MOVE
  ].includes(category as ErrandCategory);

  if (isQueueTask) {
    return <QueueingStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  if (isPickupTask) {
    return <PickupErrandFlow ride={ride} onStatusUpdate={onStatusUpdate} />;
  }

  // Default to the new State Machine Controller for Shopping Flow and others
  return <ErrandFlowController ride={ride} onStatusUpdate={onStatusUpdate} />;
};
