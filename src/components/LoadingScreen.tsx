import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center">
      <img 
        src="/icon-loading-512.png" 
        alt="Waste Lens™" 
        className="w-48 h-48 animate-subtle-grow"
      />
    </div>
  );
};