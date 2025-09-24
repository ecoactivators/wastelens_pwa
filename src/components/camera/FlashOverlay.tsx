import React from 'react';

interface FlashOverlayProps {
  isVisible: boolean;
}

export const FlashOverlay: React.FC<FlashOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-50"></div>
  );
};