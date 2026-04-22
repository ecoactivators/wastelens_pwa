import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCamera } from '../../hooks/useCamera';
import { useLocation } from '../../hooks/useLocation';
import { useSnapCapture } from '../../hooks/useSnapCapture';
import { useWasteAgent } from '../../hooks/useWasteAgent';
import { useWasteAnalysis } from '../../hooks/useWasteAnalysis';
import { CameraPermissionPrompt } from './CameraPermissionPrompt';
import { ViewfinderOverlay } from './ViewfinderOverlay';
import { IdleTraining } from './IdleTraining';
import { FlashOverlay } from './FlashOverlay';
import { PWAInstallPrompt } from '../PWAInstallPrompt';
import { AnalysisResultDisplay } from '../AnalysisResultDisplay';
import { WasteConcierge } from '../WasteConcierge';
import { FindSmartBin } from '../FindSmartBin';
import { UpgradePrompt } from '../UpgradePrompt';
import { Home, MapPin, MessageCircle, Plus } from 'lucide-react';

export const Viewfinder: React.FC = () => {
  const { user } = useAuth();
  const { permissionState, videoRef, requestCameraAccess } = useCamera();
  const { location } = useLocation();
  const { isCapturing, showFlash, triggerSnap } = useSnapCapture({ videoRef, location, userId: user?.id ?? null });
  const { recordSnapSuccess, updateActivity, shouldShowIdleTraining } = useWasteAgent(user?.id ?? null);
  const { isAnalyzing, analysisResult, error, analyzeWaste, clearAnalysis } = useWasteAnalysis();

  const [showIdleTraining, setShowIdleTraining] = useState(false);
  const [showAnalysisView, setShowAnalysisView] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const [idleStartTime, setIdleStartTime] = useState<number>(Date.now());
  const [showConcierge, setShowConcierge] = useState(false);
  const [showFindBin, setShowFindBin] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }

    setShowIdleTraining(false);
    setIdleStartTime(Date.now());
    updateActivity();

    const timer = setTimeout(() => {
      const idleTime = Date.now() - idleStartTime;
      if (shouldShowIdleTraining(idleTime)) {
        setShowIdleTraining(true);
      }
    }, 2000);

    setIdleTimer(timer);
  };

  useEffect(() => {
    if (permissionState.granted) {
      resetIdleTimer();
    }

    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [permissionState.granted]);

  const handleSnap = async () => {
    const snapResult = await triggerSnap();

    if (snapResult) {
      setCapturedImageData(snapResult.imageData || null);
      recordSnapSuccess();
      setShowAnalysisView(true);

      if (snapResult.imageData && user?.id) {
        await analyzeWaste(snapResult.imageData, snapResult.id, user.id, location || undefined);
      }
    }

    resetIdleTimer();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        if (imageData) {
          setCapturedImageData(imageData);
          recordSnapSuccess();
          setShowAnalysisView(true);

          if (user?.id) {
            const tempSnapId = `upload_${Date.now()}`;
            await analyzeWaste(imageData, tempSnapId, user.id, location || undefined);
          }
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process selected image:', error);
      alert('Failed to process the selected image. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAnalysis = () => {
    setShowAnalysisView(false);
    setCapturedImageData(null);
    clearAnalysis();

    setTimeout(() => {
      if (videoRef.current && !videoRef.current.srcObject) {
        requestCameraAccess();
      }
    }, 100);
  };

  const handleUserInteraction = () => {
    resetIdleTimer();
  };

  if (permissionState.denied) {
    return <CameraPermissionPrompt onRetry={requestCameraAccess} />;
  }

  if (permissionState.loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-white text-lg">Initializing camera...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative min-h-screen bg-black overflow-hidden ${showAnalysisView ? 'hidden' : ''}`}
        onTouchStart={handleUserInteraction}
        onMouseMove={handleUserInteraction}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/20"></div>

        <FlashOverlay isVisible={showFlash} />
        <ViewfinderOverlay />
        <IdleTraining isVisible={showIdleTraining} />

        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center pointer-events-none" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
          <div className="pointer-events-auto">
            <button
              onClick={handleSnap}
              disabled={!permissionState.granted || isCapturing}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isCapturing ? 'animate-capture' : ''}`}
            >
              <img
                src="/Waste_Lens_(1).png"
                alt="Waste Lens"
                className="w-full h-full rounded-full object-cover"
              />
            </button>
          </div>
        </div>

        {fabOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setFabOpen(false)}
            className="absolute inset-0 z-30 animate-fade-in-fast"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          />
        )}

        <div
          className="absolute z-40 flex flex-col items-end gap-3"
          style={{ right: '20px', bottom: '44px' }}
        >
          {fabOpen && (
            <div className="flex flex-col items-end gap-3 mb-1">
              {[
                { key: 'hub', label: 'Household Hub', Icon: Home, action: () => setShowUpgradePrompt(true) },
                { key: 'bins', label: 'Smart Bins', Icon: MapPin, action: () => setShowFindBin(true) },
                { key: 'concierge', label: 'Waste Concierge', Icon: MessageCircle, action: () => setShowConcierge(true) },
              ].map((item, i) => (
                <button
                  key={item.key}
                  onClick={() => { item.action(); setFabOpen(false); }}
                  className="flex items-center gap-3 fab-item-anim"
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <span
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white whitespace-nowrap"
                    style={{
                      background: 'rgba(0,17,35,0.82)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(87,235,221,0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: '#001123',
                      border: '2px solid #57ebdd',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    <item.Icon className="w-5 h-5" style={{ color: '#57ebdd' }} />
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setFabOpen((v) => !v)}
            aria-label={fabOpen ? 'Close Waste Agent menu' : 'Open Waste Agent menu'}
            className={`rounded-full flex items-center justify-center transition-transform duration-300 ${fabOpen ? 'fab-open' : 'fab-pulse'}`}
            style={{
              width: '56px',
              height: '56px',
              background: '#001123',
              border: '2px solid #57ebdd',
            }}
          >
            <Plus className="w-6 h-6" style={{ color: '#57ebdd' }} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <PWAInstallPrompt />

        {location && (
          <div className="absolute top-4 right-4 bg-primary-bg/80 backdrop-blur-sm rounded-lg px-3 py-1">
            <p className="text-secondary-gold text-xs">📍 Location ready</p>
          </div>
        )}

        <style>{`
          @keyframes fabPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(87,235,221,0.4), 0 0 0 rgba(87,235,221,0); }
            50% { box-shadow: 0 0 32px rgba(87,235,221,0.75), 0 0 0 6px rgba(87,235,221,0.08); }
          }
          .fab-pulse {
            animation: fabPulse 2s ease-in-out infinite;
          }
          .fab-open {
            transform: rotate(45deg);
            box-shadow: 0 0 24px rgba(87,235,221,0.55);
          }
          @keyframes fabItemIn {
            from { opacity: 0; transform: translateX(16px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .fab-item-anim {
            opacity: 0;
            animation: fabItemIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          @keyframes fadeInFast {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in-fast {
            animation: fadeInFast 180ms ease-out both;
          }
        `}</style>
      </div>

      {showAnalysisView && (
        <AnalysisResultDisplay
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          error={error}
          capturedImage={capturedImageData}
          onClearAnalysis={handleClearAnalysis}
          onOpenFindBin={() => { setShowFindBin(true); setShowAnalysisView(false); }}
          onOpenUpgradePrompt={() => setShowUpgradePrompt(true)}
        />
      )}

      {showConcierge && (
        <WasteConcierge
          onClose={() => setShowConcierge(false)}
          onGoToCamera={() => setShowConcierge(false)}
          onGoToHouseholdHub={() => { setShowConcierge(false); setShowUpgradePrompt(true); }}
          onGoToFindBin={() => { setShowConcierge(false); setShowFindBin(true); }}
        />
      )}

      {showFindBin && (
        <FindSmartBin
          onBack={() => setShowFindBin(false)}
          onUnlockComplete={() => {
            setShowFindBin(false);
            setShowAnalysisView(false);
          }}
        />
      )}

      {showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          onSuccess={() => setShowUpgradePrompt(false)}
        />
      )}
    </>
  );
};
