import React from 'react';
import { RideRequest, RideStatus } from '../../../types';
import { HouseholdStateMachine } from './machines/HouseholdStateMachine';

interface MoverFlowProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

export const MoverFlow: React.FC<MoverFlowProps> = ({ ride, onStatusUpdate }) => {
  return <HouseholdStateMachine ride={ride} onStatusUpdate={onStatusUpdate} />;
};
