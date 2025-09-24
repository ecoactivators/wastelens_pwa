import { Platform, Linking } from 'react-native';

export interface MapSuggestion {
    text: string;
    searchQuery: string;
    type: 'recycling_center' | 'store' | 'facility';
}

export class MapsService {
    /**
     * Opens the user's preferred maps app with a search query
     * @param searchQuery The location/business to search for
     * @param fallbackQuery Optional fallback query if the main one fails
     */
    static async openMapsSearch(searchQuery: string, fallbackQuery?: string): Promise<void> {
        try {
            console.log('🗺️ [MapsService] Opening maps search for:', searchQuery);

            // Encode the search query for URL
            const encodedQuery = encodeURIComponent(searchQuery);

            let mapsUrl: string;

            if (Platform.OS === 'ios') {
                // Try Apple Maps first, fallback to Google Maps
                mapsUrl = `maps://maps.apple.com/?q=${encodedQuery}`;

                const canOpenAppleMaps = await Linking.canOpenURL(mapsUrl);
                if (!canOpenAppleMaps) {
                    // Fallback to Google Maps on iOS
                    mapsUrl = `https://maps.google.com/maps?q=${encodedQuery}`;
                }
            } else if (Platform.OS === 'android') {
                // Try Google Maps app first, fallback to web
                mapsUrl = `geo:0,0?q=${encodedQuery}`;

                const canOpenGoogleMaps = await Linking.canOpenURL(mapsUrl);
                if (!canOpenGoogleMaps) {
                    // Fallback to Google Maps web
                    mapsUrl = `https://maps.google.com/maps?q=${encodedQuery}`;
                }
            } else {
                // Web platform - open Google Maps in browser
                mapsUrl = `https://maps.google.com/maps?q=${encodedQuery}`;
            }

            console.log('🗺️ [MapsService] Opening URL:', mapsUrl);

            const canOpen = await Linking.canOpenURL(mapsUrl);
            if (canOpen) {
                await Linking.openURL(mapsUrl);
                console.log('✅ [MapsService] Successfully opened maps');
            } else {
                // Final fallback - try the fallback query or Google Maps web
                const finalUrl = fallbackQuery
                    ? `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}`
                    : `https://maps.google.com/maps?q=${encodedQuery}`;

                console.log('🗺️ [MapsService] Fallback to:', finalUrl);
                await Linking.openURL(finalUrl);
            }
        } catch (error) {
            console.error('❌ [MapsService] Error opening maps:', error);

            // Last resort - try to open Google Maps web with a simple query
            try {
                const simpleQuery = searchQuery.split(' ').slice(0, 3).join(' '); // Take first 3 words
                const fallbackUrl = `https://maps.google.com/maps?q=${encodeURIComponent(simpleQuery)}`;
                console.log('🗺️ [MapsService] Last resort fallback:', fallbackUrl);
                await Linking.openURL(fallbackUrl);
            } catch (finalError) {
                console.error('❌ [MapsService] Final fallback failed:', finalError);
                throw new Error('Unable to open maps application');
            }
        }
    }

    /**
     * Opens maps search for a specific map suggestion
     * @param suggestion The map suggestion object containing search query and type
     */
    static async openMapSuggestion(suggestion: MapSuggestion): Promise<void> {
        try {
            console.log('🗺️ [MapsService] Opening map suggestion:', suggestion.type, suggestion.searchQuery);

            // Create a fallback query based on the suggestion type
            let fallbackQuery: string;
            switch (suggestion.type) {
                case 'recycling_center':
                    fallbackQuery = 'recycling center near me';
                    break;
                case 'store':
                    fallbackQuery = 'store near me';
                    break;
                case 'facility':
                    fallbackQuery = 'waste management facility near me';
                    break;
                default:
                    fallbackQuery = 'near me';
            }

            await this.openMapsSearch(suggestion.searchQuery, fallbackQuery);
        } catch (error) {
            console.error('❌ [MapsService] Error opening map suggestion:', error);
            throw error;
        }
    }

    /**
     * Gets the appropriate maps URL scheme for the current platform
     * @param searchQuery The search query
     * @returns The maps URL for the platform
     */
    static getMapsUrl(searchQuery: string): string {
        const encodedQuery = encodeURIComponent(searchQuery);

        if (Platform.OS === 'ios') {
            return `maps://maps.apple.com/?q=${encodedQuery}`;
        } else if (Platform.OS === 'android') {
            return `geo:0,0?q=${encodedQuery}`;
        } else {
            return `https://maps.google.com/maps?q=${encodedQuery}`;
        }
    }

    /**
     * Checks if the device can open maps
     * @returns Promise<boolean> indicating if maps can be opened
     */
    static async canOpenMaps(): Promise<boolean> {
        try {
            if (Platform.OS === 'web') {
                return true; // Web can always open Google Maps
            }

            const testQuery = 'test';
            const mapsUrl = this.getMapsUrl(testQuery);
            return await Linking.canOpenURL(mapsUrl);
        } catch (error) {
            console.error('❌ [MapsService] Error checking maps availability:', error);
            return false;
        }
    }
}