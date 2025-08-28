import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useLocation } from '../../hooks/useLocation';
import { useSnapCapture } from '../../hooks/useSnapCapture';
import { useWasteAgent } from '../../hooks/useWasteAgent';
import { useWasteAnalysis } from '../../hooks/useWasteAnalysis';
import { CameraPermissionPrompt } from './CameraPermissionPrompt';
import { ViewfinderOverlay } from './ViewfinderOverlay';
import { IdleTraining } from './IdleTraining';
import { SnapButton } from './SnapButton';
import { FlashOverlay } from './FlashOverlay';
import { PWAInstallPrompt } from '../PWAInstallPrompt';
import { AnalysisResultDisplay } from '../AnalysisResultDisplay';
import { ImageIcon, Zap } from 'lucide-react';

export const Viewfinder: React.FC = () => {
  const { permissionState, videoRef, requestCameraAccess } = useCamera();
  const { location } = useLocation();
  const { isCapturing, showFlash, triggerSnap } = useSnapCapture({ videoRef, location });
  const { recordSnapSuccess, updateActivity, shouldShowIdleTraining } = useWasteAgent();
  const { isAnalyzing, analysisResult, error, analyzeWaste, clearAnalysis } = useWasteAnalysis();
  
  const [showIdleTraining, setShowIdleTraining] = useState(false);
  const [showAnalysisView, setShowAnalysisView] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const [idleStartTime, setIdleStartTime] = useState<number>(Date.now());
  
  // File input ref for camera roll selection
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle idle state for training with agent logic
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
    }, 2000); // Check after 2 seconds of idle
    
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
    console.log('📸 [Snap] Snap triggered! 1', { 
      location,
      cameraGranted: permissionState.granted,
      videoElement: !!videoRef.current,
      videoSrcObject: !!videoRef.current?.srcObject
    });
    
    const snapResult = await triggerSnap();

    console.log('📸 [Snap] Snap triggered! 2', { 
      location,
      cameraGranted: permissionState.granted,
      videoElement: !!videoRef.current,
      videoSrcObject: !!videoRef.current?.srcObject
    });
    
    if (snapResult) {
      console.log('📸 [Snap] Snap successful, transitioning to analyze...', {
        snapId: snapResult.id,
        hasImageData: !!snapResult.imageData,
        imageSize: snapResult.imageData?.length
      });
      setCapturedImageData(snapResult.imageData || null);
      recordSnapSuccess();

      console.log('📸 [Snap] Snap triggered! 3', { 
        location,
        cameraGranted: permissionState.granted,
        videoElement: !!videoRef.current,
        videoSrcObject: !!videoRef.current?.srcObject
      });
      
      // Transition to analyze view
      setShowAnalysisView(true);

      console.log('📸 [Snap] Snap triggered! 4', { 
        location,
        cameraGranted: permissionState.granted,
        videoElement: !!videoRef.current,
        videoSrcObject: !!videoRef.current?.srcObject
      });
      
      // Start analysis with image and location
      if (snapResult.imageData) {
        console.log('🤖 [ViewFinder] Starting waste analysis...');
        await analyzeWaste(snapResult.imageData, location || undefined);
        console.log('📸 [Snap] Snap triggered! 5', { 
          location,
          cameraGranted: permissionState.granted,
          videoElement: !!videoRef.current,
          videoSrcObject: !!videoRef.current?.srcObject
        });
      }
    } else {
      console.error('📸 [Snap] Snap failed - no result returned');
    }
    
    resetIdleTimer(); // Reset idle state on interaction
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        if (imageData) {
          setCapturedImageData(imageData);
          console.log('Image selected from camera roll, starting analysis...');
          
          // Record as successful snap for agent learning
          recordSnapSuccess();
          
          // Transition to analysis view
          setShowAnalysisView(true);
          
          // Start analysis with selected image and location
          await analyzeWaste(imageData, location || undefined);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process selected image:', error);
      alert('Failed to process the selected image. Please try again.');
    }
    
    // Clear the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectFromCameraRoll = () => {
    fileInputRef.current?.click();
  };

  const handleClearAnalysis = () => {
    console.log('🔄 [Analysis] Clearing analysis and returning to camera view');
    console.log('🔄 [Analysis] Camera state before clearing:', {
      cameraGranted: permissionState.granted,
      videoElement: !!videoRef.current,
      videoSrcObject: !!videoRef.current?.srcObject
    });
    
    setShowAnalysisView(false);
    setCapturedImageData(null);
    clearAnalysis();
    
    // Re-request camera access after returning to viewfinder
    setTimeout(() => {
      console.log('🔄 [Analysis] Camera state after clearing:', {
        cameraGranted: permissionState.granted,
        videoElement: !!videoRef.current,
        videoSrcObject: !!videoRef.current?.srcObject,
        videoReadyState: videoRef.current?.readyState,
        videoPaused: videoRef.current?.paused
      });
      
      // If videoRef is available but has no stream, restart camera
      if (videoRef.current && !videoRef.current.srcObject) {
        console.log('🔄 [Analysis] Video element exists but no stream - restarting camera');
        requestCameraAccess();
      }
    }, 100);
  };

  const handleUserInteraction = () => {
    resetIdleTimer();
  };

  // Show permission prompt if camera access is denied
  if (permissionState.denied) {
    return <CameraPermissionPrompt onRetry={requestCameraAccess} />;
  }

  // Show loading state
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
      {/* Camera View - Always rendered but hidden when showing analysis */}
      <div 
        className={`relative min-h-screen bg-black overflow-hidden ${
          showAnalysisView ? 'hidden' : ''
        }`}
        onTouchStart={handleUserInteraction}
        onMouseMove={handleUserInteraction}
      >
        {/* Camera Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Dark overlay for better UI visibility */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Flash Overlay */}
        <FlashOverlay isVisible={showFlash} />
        
        {/* Viewfinder Overlay */}
        <ViewfinderOverlay />
        
        {/* Idle Training */}
        <IdleTraining isVisible={showIdleTraining} />
        
        {/* Snap Button */}
        <SnapButton 
          onSnap={handleSnap} 
          disabled={!permissionState.granted} 
          isCapturing={isCapturing}
        />
        
        {/* Camera Roll Selection Button with Hover Text */}
        <div className="absolute bottom-8 left-8 group">
          <button
            onClick={handleSelectFromCameraRoll}
            className="w-16 h-16 bg-primary-bg/80 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <ImageIcon className="w-6 h-6 text-primary-accent-cyan" />
            <span className="hidden group-hover:block text-secondary-white text-xs mt-1 absolute top-full whitespace-nowrap">
              Select Photo
            </span>
          </button>
        </div>
        
        {/* Activate Hub Button with Hover Text */}
        <div className="absolute bottom-8 right-8 group">
          <button
            onClick={() => {
              console.log('Activate Hub clicked');
              alert('Coming soon! Agentic AI-orchestrated diversion. A done-for-you experience!');
            }}
            className="w-16 h-16 bg-primary-bg/80 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-6 h-6 text-primary-accent-cyan" />
            <span className="hidden group-hover:block text-secondary-white text-xs mt-1 absolute top-full whitespace-nowrap">
              Activate Hub
            </span>
          </button>
        </div>
        
        {/* Hidden file input for camera roll selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
        
        {/* Status indicator for location (optional debug) */}
        {location && (
          <div className="absolute top-4 right-4 bg-primary-bg/80 backdrop-blur-sm rounded-lg px-3 py-1">
            <p className="text-secondary-gold text-xs">📍 Location ready</p>
          </div>
        )}
      </div>

      {/* Analysis View - Only rendered when needed */}
      {showAnalysisView && (
        <AnalysisResultDisplay
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          error={error}
          capturedImage={capturedImageData}
          onClearAnalysis={handleClearAnalysis}
        />
      )}
    </>
  );
};