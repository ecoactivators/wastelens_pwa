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
    console.log('🎥 [Camera] Requesting camera access...');
    try {
      setPermissionState({ granted: false, denied: false, loading: true });
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera when available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('🎥 [Camera] Media stream obtained:', {
        id: mediaStream.id,
        active: mediaStream.active,
        tracks: mediaStream.getVideoTracks().length
      });
      setStream(mediaStream);
      setPermissionState({ granted: true, denied: false, loading: false });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('🎥 [Camera] Stream attached to video element');
      } else {
        console.warn('🎥 [Camera] Video ref not available when setting stream');
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setPermissionState({ granted: false, denied: true, loading: false });
    }
  };

  const stopCamera = () => {
    console.log('🎥 [Camera] Stopping camera...');
    if (stream) {
      console.log('🎥 [Camera] Stopping tracks:', stream.getVideoTracks().length);
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      console.log('🎥 [Camera] Camera stopped and stream cleared');
    } else {
      console.log('🎥 [Camera] No stream to stop');
    }
  };

  useEffect(() => {
    console.log('🎥 [Camera] useCamera hook mounted, requesting access');
    requestCameraAccess();
    return () => {
      console.log('🎥 [Camera] useCamera hook unmounting, stopping camera');
      stopCamera();
    };
  }, []);

  // Debug stream state changes
  useEffect(() => {
    if (stream) {
      console.log('🎥 [Camera] Stream state changed:', {
        id: stream.id,
        active: stream.active,
        tracks: stream.getVideoTracks().map(track => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState
        }))
      });
    } else {
      console.log('🎥 [Camera] Stream is null');
    }
  // Debug video element state
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      console.log('🎥 [Camera] Video element state:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        srcObject: !!video.srcObject
      });
    }
  }, [stream, videoRef.current]);
  }, [stream]);
  return {
    permissionState,
    stream,
    videoRef,
    requestCameraAccess,
    stopCamera,
  };
};