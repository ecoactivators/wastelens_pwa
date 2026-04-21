import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center">
      <img 
        src="/Logos_for_Waste_Lens_and_Resell_Agent.png"
        alt="Waste Lens™" 
        className="w-48 h-48 animate-subtle-grow"
      />
    </div>
  );
};