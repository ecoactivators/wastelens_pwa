import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { WasteConcierge } from './WasteConcierge';
import { Viewfinder } from './camera/Viewfinder';
import { FindSmartBin } from './FindSmartBin';
import { UpgradePrompt } from './UpgradePrompt';

export const WasteConciergeScreen: React.FC = () => {
  const { user, isAnonymous } = useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [showFindBin, setShowFindBin] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Primary screen — always mounted */}
      <WasteConcierge
        onGoToCamera={() => setShowCamera(true)}
        onGoToHouseholdHub={() => setShowUpgradePrompt(true)}
        onGoToFindBin={() => setShowFindBin(true)}
        user={user}
        isAnonymous={isAnonymous}
      />

      {/* Camera overlay — slides up over the Concierge */}
      <div
        className="fixed inset-0 z-50 transition-transform duration-300 ease-in-out"
        style={{ transform: showCamera ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <Viewfinder
          onDismiss={() => setShowCamera(false)}
          onOpenFindBin={() => { setShowCamera(false); setShowFindBin(true); }}
          onOpenUpgradePrompt={() => setShowUpgradePrompt(true)}
        />
      </div>

      {showFindBin && (
        <FindSmartBin
          onBack={() => setShowFindBin(false)}
          onUnlockComplete={() => setShowFindBin(false)}
        />
      )}

      {showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          onSuccess={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};
