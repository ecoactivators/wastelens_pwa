import { useState, useEffect, useRef } from 'react';
import { CameraPermissionState } from '../types/waste';

export const useCamera = () => {
  const [permissionState, setPermissionState] = useState<CameraPermissionState>({
    granted: false,
    denied: false,
    loading: true,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestCameraAccess = async () => {
    try {
      setPermissionState({ granted: false, denied: false, loading: true });
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' }, // Force back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      setPermissionState({ granted: true, denied: false, loading: false });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setPermissionState({ granted: false, denied: true, loading: false });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    requestCameraAccess();
    return () => stopCamera();
  }, []);

  return {
    permissionState,
    stream,
    videoRef,
    requestCameraAccess,
    stopCamera,
  };
};