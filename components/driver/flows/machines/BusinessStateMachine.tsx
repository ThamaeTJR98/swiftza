import React, { useState } from 'react';
import { RideRequest, RideStatus, RideStop } from '../../../../types';
import { MultiStopRoutingOverview } from '../modules/business/MultiStopRoutingOverview';
import { DocumentVerificationScan } from '../modules/business/DocumentVerificationScan';
import { RunnerNavToBusiness } from '../modules/business/RunnerNavToBusiness';
import { FormSubmissionProof } from '../modules/business/FormSubmissionProof';
import { MultiStopSettlementSummary } from '../modules/business/MultiStopSettlementSummary';
import { RunnerActiveQueueTimer } from '../modules/queueing/RunnerActiveQueueTimer';

interface Props {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type BusinessState = 
  | 'ROUTE_OVERVIEW' 
  | 'DOC_VERIFICATION' 
  | 'NAV_TO_STOP' 
  | 'QUEUEING'
  | 'SUBMISSION' 
  | 'SUMMARY';

export const BusinessStateMachine: React.FC<Props> = ({ ride, onStatusUpdate }) => {
  const [currentState, setCurrentState] = useState<BusinessState>('ROUTE_OVERVIEW');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [queueStartTime, setQueueStartTime] = useState(0);

  // Mock stops if none exist
  const stops: RideStop[] = ride.stops && ride.stops.length > 0 ? ride.stops : [
      { id: '1', type: 'PICKUP', address: 'Head Office', lat: 0, lng: 0, status: 'PENDING' },
      { id: '2', type: 'QUEUE', address: 'Dept of Labour', lat: 0, lng: 0, status: 'PENDING' },
      { id: '3', type: 'DROPOFF', address: 'Bank Branch', lat: 0, lng: 0, status: 'PENDING' }
  ];

  const currentStop = stops[currentStopIndex];

  const handleStopComplete = () => {
      if (currentStopIndex < stops.length - 1) {
          setCurrentStopIndex(prev => prev + 1);
          setCurrentState('NAV_TO_STOP');
      } else {
          setCurrentState('SUMMARY');
      }
  };

  if (currentState === 'ROUTE_OVERVIEW') {
    return (
      <MultiStopRoutingOverview 
        stops={stops} 
        currentStopIndex={currentStopIndex} 
        onStartRoute={() => setCurrentState('DOC_VERIFICATION')} 
      />
    );
  }

  if (currentState === 'DOC_VERIFICATION') {
    return (
      <div className="h-full flex flex-col">
        <DocumentVerificationScan />
        <div className="p-6 mt-auto">
            <button 
                onClick={() => setCurrentState('NAV_TO_STOP')}
                className="w-full h-16 bg-brand-teal text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all"
            >
                Docs Verified
            </button>
        </div>
      </div>
    );
  }

  if (currentState === 'NAV_TO_STOP') {
    return (
      <RunnerNavToBusiness 
        currentStop={currentStop} 
        onArrive={() => {
            if (currentStop.type === 'QUEUE') {
                setQueueStartTime(Date.now());
                setCurrentState('QUEUEING');
            } else {
                setCurrentState('SUBMISSION');
            }
        }} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'QUEUEING') {
      return (
          <RunnerActiveQueueTimer 
            startTime={queueStartTime}
            baseRatePerMin={3.00} // Higher rate for business
            onFinishQueue={() => setCurrentState('SUBMISSION')}
            onAbandonQueue={() => onStatusUpdate(RideStatus.CANCELLED)}
            ride={ride}
          />
      );
  }

  if (currentState === 'SUBMISSION') {
    return (
      <FormSubmissionProof 
        onConfirm={handleStopComplete} 
      />
    );
  }

  if (currentState === 'SUMMARY') {
    return (
      <MultiStopSettlementSummary 
        stopsCompleted={stops.length} 
        totalExpenses={150.00} // Mock expense
        onFinish={() => onStatusUpdate(RideStatus.COMPLETED)} 
      />
    );
  }

  return null;
};
