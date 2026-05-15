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
import { ArrowLeft } from 'lucide-react';

interface ViewfinderProps {
  onDismiss: () => void;
  onOpenFindBin: () => void;
  onOpenUpgradePrompt: () => void;
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  onDismiss,
  onOpenFindBin,
  onOpenUpgradePrompt,
}) => {
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
    } catch (err) {
      console.error('Failed to process selected image:', err);
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
    onDismiss();
  };

  const handleUserInteraction = () => {
    resetIdleTimer();
  };

  if (permissionState.denied) {
    return (
      <div className="relative w-full h-full min-h-screen bg-primary-bg">
        <CameraPermissionPrompt onRetry={requestCameraAccess} />
        <button
          onClick={onDismiss}
          className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center z-50"
          style={{ background: 'rgba(0,17,35,0.7)', border: '2px solid #57ebdd' }}
          aria-label="Back to Concierge"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#57ebdd' }} />
        </button>
      </div>
    );
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

        {/* Back to Concierge */}
        <div className="absolute top-6 left-6 z-40">
          <button
            onClick={onDismiss}
            aria-label="Back to Waste Concierge"
            className="w-12 h-12 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            style={{ background: 'rgba(0,17,35,0.7)' }}
          >
            <ArrowLeft className="w-5 h-5 text-primary-accent-cyan" />
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

      </div>

      {showAnalysisView && (
        <AnalysisResultDisplay
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          error={error}
          capturedImage={capturedImageData}
          onClearAnalysis={handleClearAnalysis}
          onOpenFindBin={onOpenFindBin}
          onOpenUpgradePrompt={onOpenUpgradePrompt}
        />
      )}
    </>
  );
};
