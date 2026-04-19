import React from 'react';
import { X, MessageSquare } from 'lucide-react';

interface WasteConciergeProps {
  onClose: () => void;
  onGoToCamera: () => void;
  onGoToHouseholdHub: () => void;
  onGoToFindBin: () => void;
}

export const WasteConcierge: React.FC<WasteConciergeProps> = ({
  onClose,
  onGoToCamera,
  onGoToHouseholdHub,
  onGoToFindBin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(0, 17, 35, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(87, 235, 221, 0.25)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(87,235,221,0.08)',
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(87,235,221,0.15)', border: '1px solid rgba(87,235,221,0.3)' }}
              >
                <MessageSquare className="w-4 h-4" style={{ color: '#57ebdd' }} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">Waste Concierge</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.2)' }}
            >
              <X className="w-4 h-4" style={{ color: '#57ebdd' }} />
            </button>
          </div>

          <div className="mb-6">
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[85%]"
              style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.2)' }}
            >
              <p className="text-white text-sm leading-relaxed">What would you like to do next?</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onClose(); onGoToCamera(); }}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
              style={{
                background: 'rgba(0,17,35,0.6)',
                border: '1.5px solid rgba(87,235,221,0.5)',
              }}
            >
              Snap next Waste Item
            </button>

            <button
              onClick={() => { onClose(); onGoToHouseholdHub(); }}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
              style={{
                background: 'rgba(0,17,35,0.6)',
                border: '1.5px solid rgba(87,235,221,0.5)',
              }}
            >
              Go to Household Hub
            </button>

            <button
              onClick={() => { onClose(); onGoToFindBin(); }}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
              style={{
                background: 'rgba(0,17,35,0.6)',
                border: '1.5px solid rgba(87,235,221,0.5)',
              }}
            >
              Find | Unlock Smart Bin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
