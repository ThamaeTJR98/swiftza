import React, { useState } from 'react';
import { WAITING_FLAT_FEE, WAITING_PER_MINUTE } from '../utils/paymentEngine';

interface Props {
  onSelect: (
    preference: 'WAIT_FOR_ME' | 'DROP_AND_RETURN',
    waitingCharge?: {
      flatBookingFee: number;
      perMinuteRate: number;
      estimatedWaitMinutes: number;
      estimatedWaitCost: number;
    }
  ) => void;
  baseFare: number;
}

export const WaitingPreferenceSelector: React.FC<Props> = ({ onSelect, baseFare }) => {
  const [selected, setSelected] = useState<'WAIT_FOR_ME' | 'DROP_AND_RETURN' | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);

  const estimatedWaitCost = WAITING_FLAT_FEE + (estimatedMinutes * WAITING_PER_MINUTE);
  const totalWithWaiting = baseFare + estimatedWaitCost;

  const handleConfirm = () => {
    if (!selected) return;

    if (selected === 'WAIT_FOR_ME') {
      onSelect('WAIT_FOR_ME', {
        flatBookingFee: WAITING_FLAT_FEE,
        perMinuteRate: WAITING_PER_MINUTE,
        estimatedWaitMinutes: estimatedMinutes,
        estimatedWaitCost,
      });
    } else {
      onSelect('DROP_AND_RETURN');
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md space-y-4">
      <h3 className="text-base font-semibold text-gray-800">
        Will your driver need to wait for you?
      </h3>
      <p className="text-sm text-gray-500">
        Let us know how you'd like this trip to work at your destination.
      </p>

      {/* Option 1 — Wait For Me */}
      <button
        onClick={() => setSelected('WAIT_FOR_ME')}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          selected === 'WAIT_FOR_ME'
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Wait for me</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Driver stays at your destination until you're done
            </p>
            <p className="text-xs text-teal-600 mt-1 font-medium">
              R{WAITING_FLAT_FEE} booking fee + R{WAITING_PER_MINUTE}/min standing charge
            </p>
          </div>
          <span className="text-2xl">⏳</span>
        </div>
      </button>

      {/* Estimated wait time slider — only shown if Wait For Me selected */}
      {selected === 'WAIT_FOR_ME' && (
        <div className="bg-teal-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Estimated wait time</span>
            <span className="text-teal-700">{estimatedMinutes} min</span>
          </div>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5 min</span>
            <span>120 min</span>
          </div>
          <div className="bg-white rounded-lg p-3 mt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Booking fee</span>
              <span>R{WAITING_FLAT_FEE}.00</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Est. waiting ({estimatedMinutes} min × R{WAITING_PER_MINUTE})</span>
              <span>R{estimatedMinutes * WAITING_PER_MINUTE}.00</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 border-t pt-1 mt-1">
              <span>Est. waiting charge</span>
              <span>R{estimatedWaitCost}.00</span>
            </div>
            <div className="flex justify-between font-bold text-teal-700">
              <span>New trip total (est.)</span>
              <span>R{totalWithWaiting}.00</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">
            * Final charge based on actual time. Meter starts when driver arrives and ends when you return.
          </p>
        </div>
      )}

      {/* Option 2 — Drop & Return */}
      <button
        onClick={() => setSelected('DROP_AND_RETURN')}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          selected === 'DROP_AND_RETURN'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Drop & Return</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Drop me off now, pick me up later when I'm done
            </p>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              No waiting charge — standard fare only
            </p>
          </div>
          <span className="text-2xl">🔄</span>
        </div>
      </button>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!selected}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
          selected
            ? 'bg-teal-500 hover:bg-teal-600 active:scale-95'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Confirm Preference
      </button>
    </div>
  );
};