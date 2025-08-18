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
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Calculate scaled dimensions (max 1024px on longest side)
    const maxSize = 1024;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
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
    
    // Set canvas dimensions to scaled size
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Draw current video frame to canvas with scaling
    context.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    // Convert to base64 with reduced quality
    return canvas.toDataURL('image/jpeg', 0.7);
  }, [videoRef]);

  const triggerSnap = useCallback(async (): Promise<SnapMetadata | null> => {
    if (isCapturing) return null;

    setIsCapturing(true);
    setShowFlash(true);

    try {
      // Capture the image
      const imageData = await captureImage();
      
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

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

      console.log('Snap captured:', {
        id: snapMetadata.id,
        timestamp: snapMetadata.timestamp,
        hasLocation: !!(snapMetadata.latitude && snapMetadata.longitude),
        imageSize: imageData.length
      });

      return snapMetadata;
    } catch (error) {
      console.error('Snap capture failed:', error);
      return null;
    } finally {
      // Hide flash after animation
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