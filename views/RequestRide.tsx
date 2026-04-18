
import React from 'react';
import { useApp } from '../context/AppContext';
import { ErrandRequestFlow } from '../components/request/ErrandRequestFlow';
import { MoveRequestFlow } from '../components/request/MoveRequestFlow';

export const RequestRide: React.FC = () => {
  const { serviceType } = useApp();

  // Route to the appropriate independent flow component
  if (serviceType === 'move') return <MoveRequestFlow />;
  return <ErrandRequestFlow />;
};
