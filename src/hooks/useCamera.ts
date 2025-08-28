import { useState, useEffect, useRef } from 'react';
import { CameraPermissionState } from '../types/waste';

export const useCamera = () => {

  // const [permissionState, setPermissionState] = null;
  //   const [stream, setStream] = null;
  //   const videoRef = null;

  // const init = () => {
  //   setPermissionState(useState<CameraPermissionState>({
  //     granted: false,
  //     denied: false,
  //     loading: true,
  //   }));
  //   setStream(useState<MediaStream | null>(null));
  //   videoRef = useRef<HTMLVideoElement>(null);
  // };
  
  const [permissionState, setPermissionState] = useState<CameraPermissionState>({
    granted: false,
    denied: false,
    loading: true,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStream = null;

  //init();

  const setMediaStream = () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera when available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

    console.log('🎥 [useCamera] Media stream: ' + mediaStream);

    console.log('🎥 [useCamera] Media stream obtained:', {
      id: mediaStream.id,
      active: mediaStream.active,
      tracks: mediaStream.getVideoTracks().length
    });
    setStream(mediaStream);
  }

  const requestCameraAccess = async () => {
    if(!videoRef.current) {
      //videoRef = useRef<HTMLVideoElement>(null);
    }
    
    console.log('🎥 [useCamera] Requesting camera access...');
    try {
      setPermissionState({ granted: false, denied: false, loading: true });

      //console.log('🎥 [useCamera] Media stream: ' + mediaStream);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera when available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // console.log('🎥 [useCamera] Media stream: ' + mediaStream);

      // console.log('🎥 [useCamera] Media stream obtained:', {
      //   id: mediaStream.id,
      //   active: mediaStream.active,
      //   tracks: mediaStream.getVideoTracks().length
      // });
      // setStream(mediaStream);

      setMediaStream();
      
      setPermissionState({ granted: true, denied: false, loading: false });

      console.log('🎥 [useCamera] videoRef.current: ' + videoRef.current);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('🎥 [useCamera] Stream attached to video element');
      } else {
        console.warn('🎥 [useCamera] Video ref not available when setting stream');
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setPermissionState({ granted: false, denied: true, loading: false });
    }
  };

  const stopCamera = () => {
    console.log('🎥 [useCamera] Stopping camera...');
    if (stream) {
      console.log('🎥 [useCamera] Stopping tracks:', stream.getVideoTracks().length);
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      console.log('🎥 [useCamera] Camera stopped and stream cleared');
    } else {
      console.log('🎥 [useCamera] No stream to stop');
    }
  };

  useEffect(() => {
    console.log('🎥 [useCamera] useCamera hook mounted, requesting access');
    requestCameraAccess();
    return () => {
      console.log('🎥 [useCamera] useCamera hook unmounting, stopping camera');
      stopCamera();
    };
  }, []);

  // Debug stream state changes
  useEffect(() => {
    if (stream) {
      console.log('🎥 [useCamera] Stream state changed:', {
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
      console.log('🎥 [useCamera] Stream is null');
    }
  }, [stream]);

  // Debug video element state
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      console.log('🎥 [useCamera] Video element state:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        srcObject: !!video.srcObject
      });
    }
  }, [stream, videoRef.current]);

  return {
    permissionState,
    stream,
    videoRef,
    requestCameraAccess,
    stopCamera,
  };
};