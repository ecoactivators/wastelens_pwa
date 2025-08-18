import { useState, useEffect } from 'react';
import { LocationData } from '../types/waste';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Location access error:', error);
        setError('Location access denied');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Increased from 10 seconds to 30 seconds
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, loading, error, requestLocation };
};