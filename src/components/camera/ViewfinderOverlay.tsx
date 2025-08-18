import React from 'react';

export const ViewfinderOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Four corner viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-80 h-80 max-w-[80vw] max-h-[50vh]">
          {/* Top Left */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary-accent-cyan rounded-tl-lg"></div>
          
          {/* Top Right */}
          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary-accent-cyan rounded-tr-lg"></div>
          
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary-accent-cyan rounded-bl-lg"></div>
          
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary-accent-cyan rounded-br-lg"></div>
        </div>
      </div>
    </div>
  );
};