import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
}

export class LocationService {
    private static cachedLocation: LocationData | null = null;
    private static lastFetchTime: number = 0;
    private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    static async requestLocationPermission(): Promise<boolean> {
        try {
            console.log('📍 [LocationService] Requesting location permission...');

            // Check if location services are enabled
            const enabled = await Location.hasServicesEnabledAsync();
            if (!enabled) {
                console.warn('📍 [LocationService] Location services are disabled');
                return false;
            }

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            const granted = status === 'granted';

            console.log('📍 [LocationService] Permission status:', status);
            return granted;
        } catch (error) {
            console.error('❌ [LocationService] Error requesting permission:', error);
            return false;
        }
    }

    static async getCurrentLocation(): Promise<LocationData | null> {
        try {
            // Return cached location if still valid
            const now = Date.now();
            if (this.cachedLocation && (now - this.lastFetchTime) < this.CACHE_DURATION) {
                console.log('📍 [LocationService] Using cached location:', this.cachedLocation.city);
                return this.cachedLocation;
            }

            console.log('📍 [LocationService] Fetching current location...');

            // Check permission first
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('📍 [LocationService] Location permission not granted');
                return null;
            }

            // Get current position with timeout
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000, // 10 seconds timeout
            });

            // Reverse geocode to get city information
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                const locationData: LocationData = {
                    city: address.city || address.subregion || 'Unknown City',
                    region: address.region || address.administrativeArea || 'Unknown Region',
                    country: address.country || 'Unknown Country',
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };

                // Cache the result
                this.cachedLocation = locationData;
                this.lastFetchTime = now;

                console.log('📍 [LocationService] Location found:', {
                    city: locationData.city,
                    region: locationData.region,
                    country: locationData.country
                });

                return locationData;
            } else {
                console.warn('📍 [LocationService] No address found for coordinates');
                return null;
            }
        } catch (error) {
            console.error('❌ [LocationService] Error getting location:', error);
            return null;
        }
    }

    static async getLocationForAnalysis(): Promise<string> {
        try {
            // For web platform, we can't get precise location, so return a generic message
            if (Platform.OS === 'web') {
                console.log('📍 [LocationService] Web platform - using generic location');
                return 'your local area';
            }

            const location = await this.getCurrentLocation();
            if (location) {
                return `${location.city}, ${location.region}, ${location.country}`;
            } else {
                return 'your local area';
            }
        } catch (error) {
            console.error('❌ [LocationService] Error getting location for analysis:', error);
            return 'your local area';
        }
    }

    static clearCache(): void {
        console.log('📍 [LocationService] Clearing location cache');
        this.cachedLocation = null;
        this.lastFetchTime = 0;
    }
}