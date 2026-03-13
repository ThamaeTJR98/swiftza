import React, { useState } from 'react';
import { RideRequest, RideStatus, RideStop } from '../../../../types';
import { RunnerNavToCompanion } from '../modules/lifestyle/RunnerNavToCompanion';
import { CompanionIdentityCheck } from '../modules/lifestyle/CompanionIdentityCheck';
import { ActiveCompanionTracking } from '../modules/lifestyle/ActiveCompanionTracking';
import { CompanionDropOffProof } from '../modules/lifestyle/CompanionDropOffProof';
import { HandoverQrPinShare } from '../modules/shared/HandoverQrPinShare';

interface Props {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type LifestyleState = 
  | 'NAV_TO_PICKUP' 
  | 'IDENTITY_CHECK' 
  | 'ACTIVE_CARE' 
  | 'DROPOFF_PROOF' 
  | 'HANDOVER';

export const LifestyleStateMachine: React.FC<Props> = ({ ride, onStatusUpdate }) => {
  const [currentState, setCurrentState] = useState<LifestyleState>('NAV_TO_PICKUP');

  const pickupStop: RideStop = {
    id: 'pickup', type: 'PICKUP', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING'
  };

  if (currentState === 'NAV_TO_PICKUP') {
    return (
      <RunnerNavToCompanion 
        currentStop={pickupStop} 
        onArrive={() => setCurrentState('IDENTITY_CHECK')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'IDENTITY_CHECK') {
    return (
      <CompanionIdentityCheck />
    );
  }

  if (currentState === 'ACTIVE_CARE') {
    return (
      <ActiveCompanionTracking 
        onEmergency={() => console.log("EMERGENCY TRIGGERED")}
        onComplete={() => setCurrentState('DROPOFF_PROOF')} 
      />
    );
  }

  if (currentState === 'DROPOFF_PROOF') {
    return (
      <CompanionDropOffProof 
        onConfirm={() => setCurrentState('HANDOVER')} 
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
