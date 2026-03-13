import React, { useState } from 'react';
import { RideRequest, RideStatus, RideStop } from '../../../../types';
import { RunnerNavToPickupMover } from '../modules/household/RunnerNavToPickupMover';
import { RunnerArrivedPickupMover } from '../modules/household/RunnerArrivedPickupMover';
import { PreInspectionManifest } from '../modules/household/PreInspectionManifest';
import { AdjustMoveQuote } from '../modules/household/AdjustMoveQuote';
import { CrewConfirmation } from '../modules/household/CrewConfirmation';
import { LoadingManifest } from '../modules/household/LoadingManifest';
import { UnloadingManifest } from '../modules/household/UnloadingManifest';
import { RunnerNavToDropoffMover } from '../modules/household/RunnerNavToDropoffMover';
import { MultiStopNavigation } from '../modules/household/MultiStopNavigation';
import { StopVerification } from '../modules/household/StopVerification';
import { MoveEarningsSummary } from '../modules/household/MoveEarningsSummary';
import { GateAccessDelay } from '../modules/household/GateAccessDelay';
import { RequestMaterialFunds } from '../modules/household/RequestMaterialFunds';
import { VirtualCardActivation } from '../modules/household/VirtualCardActivation';
import { HandoverQrPinShare } from '../modules/shared/HandoverQrPinShare';

interface Props {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type HouseholdState = 
  | 'NAV_TO_PICKUP' 
  | 'ARRIVED_PICKUP'
  | 'GATE_DELAY'
  | 'PRE_INSPECTION' 
  | 'CREW_CHECKIN' 
  | 'LOADING' 
  | 'REQUEST_FUNDS'
  | 'VIRTUAL_CARD'
  | 'NAV_TO_DROPOFF' 
  | 'MULTI_STOP_NAV'
  | 'STOP_VERIFICATION'
  | 'UNLOADING' 
  | 'HANDOVER'
  | 'SUMMARY';

export const HouseholdStateMachine: React.FC<Props> = ({ ride, onStatusUpdate }) => {
  const [currentState, setCurrentState] = useState<HouseholdState>('NAV_TO_PICKUP');
  const [showAdjustQuote, setShowAdjustQuote] = useState(false);
  const [previousState, setPreviousState] = useState<HouseholdState>('LOADING');
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [requestedType, setRequestedType] = useState<string>('');

  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const pickupStop: RideStop = {
    id: 'pickup', type: 'PICKUP', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING'
  };
  
  const dropoffStop: RideStop = {
    id: 'dropoff', type: 'DROPOFF', address: ride.dropoff.address, lat: ride.dropoff.lat, lng: ride.dropoff.lng, status: 'PENDING'
  };

  const allStops = [pickupStop, ...(ride.stops || []), dropoffStop];
  const isMultiStop = allStops.length > 2;

  if (currentState === 'NAV_TO_PICKUP') {
    return (
      <RunnerNavToPickupMover 
        ride={ride}
        currentStop={pickupStop} 
        title="Heading to Pickup"
        onArrive={() => setCurrentState('ARRIVED_PICKUP')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'ARRIVED_PICKUP') {
    return (
      <RunnerArrivedPickupMover 
        currentStop={pickupStop}
        onArrive={() => setCurrentState('PRE_INSPECTION')}
        onStartTeamCheck={() => setCurrentState('CREW_CHECKIN')}
        onCancel={() => setCurrentState('NAV_TO_PICKUP')}
      />
    );
  }

  if (currentState === 'GATE_DELAY') {
      return (
          <GateAccessDelay 
            onAccessGranted={() => setCurrentState('PRE_INSPECTION')}
            onMessageClient={() => console.log("Message Client")}
          />
      );
  }

  if (currentState === 'PRE_INSPECTION') {
    return (
      <>
        <PreInspectionManifest 
          ride={ride}
          onConfirm={() => setCurrentState('CREW_CHECKIN')} 
          onReportDiscrepancy={() => setShowAdjustQuote(true)}
        />
        {showAdjustQuote && (
            <AdjustMoveQuote 
                onConfirm={(price, notes) => {
                    console.log("Quote Adjusted:", price, notes);
                    setShowAdjustQuote(false);
                }}
                onCancel={() => setShowAdjustQuote(false)}
            />
        )}
      </>
    );
  }

  if (currentState === 'CREW_CHECKIN') {
    return (
      <CrewConfirmation 
        ride={ride}
        onAllPresent={() => setCurrentState('LOADING')} 
      />
    );
  }

  if (currentState === 'LOADING') {
    return (
      <LoadingManifest 
          ride={ride}
          type="LOADING" 
          onComplete={() => {
              if (isMultiStop) {
                  setCurrentStopIndex(1);
                  setCurrentState('MULTI_STOP_NAV');
              } else {
                  setCurrentState('NAV_TO_DROPOFF');
              }
          }} 
          onRequestFunds={() => {
              setPreviousState('LOADING');
              setCurrentState('REQUEST_FUNDS');
          }}
      />
    );
  }

  if (currentState === 'REQUEST_FUNDS') {
      return (
          <RequestMaterialFunds 
            onRequest={(type, amount) => {
                setRequestedAmount(amount);
                setRequestedType(type);
                setCurrentState('VIRTUAL_CARD');
            }}
            onCancel={() => setCurrentState(previousState)}
          />
      );
  }

  if (currentState === 'VIRTUAL_CARD') {
      return (
          <VirtualCardActivation 
            amount={requestedAmount}
            expenseType={requestedType}
            onComplete={() => setCurrentState(previousState)}
          />
      );
  }

  if (currentState === 'MULTI_STOP_NAV') {
    return (
      <MultiStopNavigation 
        ride={ride}
        stops={allStops}
        currentStopIndex={currentStopIndex}
        onNavigate={() => {}}
        onConfirmArrival={() => setCurrentState('STOP_VERIFICATION')}
      />
    );
  }

  if (currentState === 'STOP_VERIFICATION') {
    return (
      <StopVerification 
        ride={ride}
        stops={allStops}
        currentStopIndex={currentStopIndex}
        onProceed={() => {
            if (currentStopIndex < allStops.length - 1) {
                setCurrentStopIndex(currentStopIndex + 1);
                setCurrentState('MULTI_STOP_NAV');
            } else {
                setCurrentState('UNLOADING');
            }
        }}
      />
    );
  }

  if (currentState === 'NAV_TO_DROPOFF') {
    return (
      <RunnerNavToDropoffMover 
        ride={ride}
        currentStop={dropoffStop} 
        onArrive={() => setCurrentState('UNLOADING')} 
        onCancel={() => onStatusUpdate(RideStatus.CANCELLED)} 
      />
    );
  }

  if (currentState === 'UNLOADING') {
    return (
      <UnloadingManifest 
        ride={ride}
        onComplete={() => setCurrentState('HANDOVER')} 
      />
    );
  }

  if (currentState === 'HANDOVER') {
    return (
      <HandoverQrPinShare 
        ride={ride}
        onVerify={() => setCurrentState('SUMMARY')}
      />
    );
  }

  if (currentState === 'SUMMARY') {
    return (
      <MoveEarningsSummary 
        totalEarnings={ride.price} 
        onFinish={() => onStatusUpdate(RideStatus.COMPLETED)} 
      />
    );
  }

  return null;
};
