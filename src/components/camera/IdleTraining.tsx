import React, { useEffect, useState } from 'react';

interface IdleTrainingProps {
  isVisible: boolean;
}

export const IdleTraining: React.FC<IdleTrainingProps> = ({ isVisible }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimate(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 animate-fade-in">
      <div className="relative">
        {/* Main training box */}
        <div className="bg-primary-bg border border-primary-accent-pink/20 rounded-2xl px-6 py-4 max-w-xs text-center shadow-lg backdrop-blur-sm">
          <p className="text-secondary-white text-base font-medium leading-relaxed">
            Snap your trash XXX
          </p>
        </div>
        
        {/* Arrow pointing down */}
        <div className="flex justify-center mt-1">
          <div 
            className={`w-0 h-0 border-l-3 border-r-3 border-t-4 border-l-transparent border-r-transparent border-t-primary-bg ${
              animate ? 'animate-appear' : ''
            }`}
            style={{
              borderLeftWidth: '8px',
              borderRightWidth: '8px',
              borderTopWidth: '10px'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};