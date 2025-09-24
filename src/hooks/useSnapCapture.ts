import { useState, useCallback } from 'react';
import { SnapMetadata } from '../types/waste';

interface UseSnapCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  location: { latitude: number; longitude: number } | null;
}

export const useSnapCapture = ({ videoRef, location }: UseSnapCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const captureImage = useCallback(async (): Promise<string | null> => {
    console.log('📸 [useSnapCapture] captureImage called');
    if (!videoRef.current) return null;

    const video = videoRef.current;
    console.log('📸 [useSnapCapture] Video element state:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused,
      currentTime: video.currentTime,
      srcObject: !!video.srcObject
    });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('📸 [useSnapCapture] Failed to get canvas 2D context');
      return null;
    }

    // Calculate scaled dimensions (max 1024px on longest side)
    const maxSize = 1024;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    console.log('📸 [useSnapCapture] Original video dimensions:', { videoWidth, videoHeight });
    
    let scaledWidth = videoWidth;
    let scaledHeight = videoHeight;
    
    if (videoWidth > videoHeight) {
      if (videoWidth > maxSize) {
        scaledWidth = maxSize;
        scaledHeight = (videoHeight * maxSize) / videoWidth;
      }
    } else {
      if (videoHeight > maxSize) {
        scaledHeight = maxSize;
        scaledWidth = (videoWidth * maxSize) / videoHeight;
      }
    }
    
    console.log('📸 [useSnapCapture] Scaled dimensions:', { scaledWidth, scaledHeight });
    
    // Set canvas dimensions to scaled size
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Draw current video frame to canvas with scaling
    context.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    // Convert to base64 with reduced quality
    const dataURL = canvas.toDataURL('image/jpeg', 0.7);
    console.log('📸 [useSnapCapture] Canvas to dataURL conversion complete:', {
      dataLength: dataURL.length,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
    
    return dataURL;
  }, [videoRef]);

  const triggerSnap = useCallback(async (): Promise<SnapMetadata | null> => {
    if (isCapturing) return null;

    console.log('📸 [useSnapCapture] Starting snap capture process...');
    setIsCapturing(true);
    setShowFlash(true);

    try {
      // Capture the image
      console.log('📸 [useSnapCapture] Capturing image from video element...');
      const imageData = await captureImage();
      
      if (!imageData) {
        console.error('📸 [useSnapCapture] Failed to capture image - no data returned');
        throw new Error('Failed to capture image');
      }

      console.log('📸 [Capture] Image captured successfully:', {
        dataLength: imageData.length,
        dataType: imageData.substring(0, 30) + '...'
      });
      // Create snap metadata
      const snapMetadata: SnapMetadata = {
        id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        latitude: location?.latitude,
        longitude: location?.longitude,
        imageData,
      };

      // Store locally (for now)
      const existingSnaps = JSON.parse(localStorage.getItem('waste_lens_snaps') || '[]');
      existingSnaps.push(snapMetadata);
      localStorage.setItem('waste_lens_snaps', JSON.stringify(existingSnaps));

      console.log('📸 [useSnapCapture] Snap metadata created and stored:', {
        id: snapMetadata.id,
        timestamp: snapMetadata.timestamp,
        hasLocation: !!(snapMetadata.latitude && snapMetadata.longitude),
        imageSize: imageData.length,
        storedSnapsCount: existingSnaps.length
      });

      return snapMetadata;
    } catch (error) {
      console.error('📸 [useSnapCapture] Snap capture failed:', error);
      return null;
    } finally {
      // Hide flash after animation
      console.log('📸 [useSnapCapture] Cleaning up capture state...');
      setTimeout(() => setShowFlash(false), 300);
      setTimeout(() => setIsCapturing(false), 500);
    }
  }, [isCapturing, captureImage, location]);

  return {
    isCapturing,
    showFlash,
    triggerSnap,
  };
};