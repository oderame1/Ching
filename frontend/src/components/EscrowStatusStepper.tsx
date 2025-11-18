'use client';

import { EscrowState } from '@escrow/shared';

const states: EscrowState[] = [
  'pending',
  'waiting_for_payment',
  'paid',
  'delivered',
  'received',
  'released',
];

interface EscrowStatusStepperProps {
  currentState: EscrowState;
}

export function EscrowStatusStepper({ currentState }: EscrowStatusStepperProps) {
  const currentIndex = states.indexOf(currentState);

  return (
    <div className="flex items-center justify-between">
      {states.map((state, index) => (
        <div key={state} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index <= currentIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
          <span className="ml-2 text-sm capitalize">{state.replace(/_/g, ' ')}</span>
          {index < states.length - 1 && (
            <div
              className={`mx-4 h-1 w-16 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

