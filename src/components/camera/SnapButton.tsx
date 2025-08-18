import React from 'react';

interface SnapButtonProps {
  onSnap: () => void;
  disabled?: boolean;
  isCapturing?: boolean;
}

export const SnapButton: React.FC<SnapButtonProps> = ({ 
  onSnap, 
  disabled = false, 
  isCapturing = false 
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <button
        onClick={onSnap}
        disabled={disabled || isCapturing}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative ${
          isCapturing ? 'animate-capture' : ''
        }`}
      >
        <img 
          src="/icon-512.png" 
          alt="Waste Lens™" 
          className="w-full h-full rounded-full object-cover"
        />
      </button>
    </div>
  );
};