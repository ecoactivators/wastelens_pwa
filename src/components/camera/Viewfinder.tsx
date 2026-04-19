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
import { MapPin, Zap, MessageSquare } from 'lucide-react';

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

        <div className="absolute bottom-8 left-0 right-0 flex items-end justify-center" style={{ gap: '0', paddingLeft: '24px', paddingRight: '24px' }}>
          <div className="flex-1 flex justify-center">
            <div className="relative group">
              <button
                onClick={() => setShowFindBin(true)}
                className="w-14 h-14 bg-primary-bg/80 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <MapPin className="w-6 h-6 text-primary-accent-cyan" />
              </button>
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap" style={{ background: 'rgba(0,17,35,0.9)', border: '1px solid rgba(87,235,221,0.3)' }}>
                Find | Unlock Smart Bin
              </span>
            </div>
          </div>

          <div className="flex-none">
            <button
              onClick={handleSnap}
              disabled={!permissionState.granted || isCapturing}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isCapturing ? 'animate-capture' : ''}`}
            >
              <img
                src="/Waste_Lens_(1).png"
                alt="Waste Lens™"
                className="w-full h-full rounded-full object-cover"
              />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="flex gap-4">
              <div className="relative group">
                <button
                  onClick={() => setShowConcierge(true)}
                  className="w-14 h-14 bg-primary-bg/80 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <MessageSquare className="w-6 h-6 text-primary-accent-cyan" />
                </button>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap" style={{ background: 'rgba(0,17,35,0.9)', border: '1px solid rgba(87,235,221,0.3)' }}>
                  Waste Concierge
                </span>
              </div>

              <div className="relative group">
                <button
                  onClick={() => setShowUpgradePrompt(true)}
                  className="w-14 h-14 bg-primary-bg/80 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Zap className="w-6 h-6 text-primary-accent-cyan" />
                </button>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap" style={{ background: 'rgba(0,17,35,0.9)', border: '1px solid rgba(87,235,221,0.3)' }}>
                  Household Hub
                </span>
              </div>
            </div>
          </div>
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
