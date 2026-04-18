import React, { useState } from 'react';
import { RideRequest, RideStatus, RideStop } from '../../../../types';
import { RunnerNavToPickup } from '../modules/delivery/RunnerNavToPickup';
import { PackagePickupVerification } from '../modules/delivery/PackagePickupVerification';
import { RunnerNavToDropoff } from '../modules/delivery/RunnerNavToDropoff';
import { PackageDeliveryProof } from '../modules/delivery/PackageDeliveryProof';
import { HandoverScanPinEntry } from '../modules/delivery/HandoverScanPinEntry';

interface Props {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type DeliveryState = 
  | 'NAV_TO_PICKUP' 
  | 'VERIFY_PICKUP' 
  | 'NAV_TO_DROPOFF' 
  | 'VERIFY_DROPOFF' 
  | 'PROOF_OF_DELIVERY';

export const DeliveryStateMachine: React.FC<Props> = ({ ride, onStatusUpdate }) => {
  const [currentState, setCurrentState] = useState<DeliveryState>('NAV_TO_PICKUP');

  const pickupStop: RideStop = {
    id: 'pickup', type: 'PICKUP', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING'
  };
  
  const dropoffStop: RideStop = {
    id: 'dropoff', type: 'DROPOFF', address: ride.dropoff.address, lat: ride.dropoff.lat, lng: ride.dropoff.lng, status: 'PENDING', customerName: ride.passenger?.name
  };

  if (currentState === 'NAV_TO_PICKUP') {
    return (
      <RunnerNavToPickup 
        currentStop={pickupStop} 
        onArrive={() => setCurrentState('VERIFY_PICKUP')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'VERIFY_PICKUP') {
    return (
      <PackagePickupVerification 
        onConfirm={() => setCurrentState('NAV_TO_DROPOFF')} 
      />
    );
  }

  if (currentState === 'NAV_TO_DROPOFF') {
    return (
      <RunnerNavToDropoff 
        currentStop={dropoffStop} 
        onArrive={() => setCurrentState('VERIFY_DROPOFF')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'VERIFY_DROPOFF') {
    return (
      <HandoverScanPinEntry 
        onVerify={() => setCurrentState('PROOF_OF_DELIVERY')} 
      />
    );
  }

  if (currentState === 'PROOF_OF_DELIVERY') {
    return (
      <PackageDeliveryProof 
        onConfirm={() => onStatusUpdate(RideStatus.COMPLETED)} 
      />
    );
  }

  return null;
};
