import React, { useState } from 'react';
import { RideRequest, RideStatus, RideStop } from '../../../../types';
import { RunnerNavToQueue } from '../modules/queueing/RunnerNavToQueue';
import { RunnerArrivedAtQueue } from '../modules/queueing/RunnerArrivedAtQueue';
import { RunnerActiveQueueTimer } from '../modules/queueing/RunnerActiveQueueTimer';
import { RunnerAbandonQueueReason } from '../modules/queueing/RunnerAbandonQueueReason';
import { RunnerHandoverSpot } from '../modules/queueing/RunnerHandoverSpot';

interface Props {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type QueueState = 
  | 'NAV_TO_QUEUE' 
  | 'ARRIVED_AT_QUEUE'
  | 'ACTIVE_QUEUE' 
  | 'HANDOVER_SPOT';

export const QueueingStateMachine: React.FC<Props> = ({ ride, onStatusUpdate }) => {
  const [currentState, setCurrentState] = useState<QueueState>('NAV_TO_QUEUE');
  const [queueStartTime, setQueueStartTime] = useState<number>(0);

  const queueStop: RideStop = {
    id: 'queue', type: 'QUEUE', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING'
  };

  if (currentState === 'NAV_TO_QUEUE') {
    return (
      <RunnerNavToQueue 
        ride={ride}
        currentStop={queueStop} 
        onArrive={() => setCurrentState('ARRIVED_AT_QUEUE')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'ARRIVED_AT_QUEUE') {
    return (
      <RunnerArrivedAtQueue 
        ride={ride}
        currentStop={queueStop} 
        onStartQueue={() => {
            setQueueStartTime(Date.now());
            setCurrentState('ACTIVE_QUEUE');
        }} 
        onBack={() => setCurrentState('NAV_TO_QUEUE')}
      />
    );
  }

  if (currentState === 'ACTIVE_QUEUE') {
    return (
      <RunnerActiveQueueTimer 
          startTime={queueStartTime} 
          baseRatePerMin={2.50} 
          onFinishQueue={() => setCurrentState('HANDOVER_SPOT')} 
          onAbandonQueue={(reason) => onStatusUpdate(RideStatus.CANCELLED, { cancellationReason: reason })}
          ride={ride}
      />
    );
  }

  if (currentState === 'HANDOVER_SPOT') {
    return (
      <RunnerHandoverSpot 
        ride={ride}
        onHandoverComplete={() => onStatusUpdate(RideStatus.COMPLETED)} 
      />
    );
  }

  return null;
};
