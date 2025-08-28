import { WasteAnalysisResponse, LocationData } from '../types/waste';

export class OpenAIService {
  private functionUrl = '/.netlify/functions/analyze-waste';

  async analyzeWasteImage(imageData: string, location?: LocationData): Promise<WasteAnalysisResponse> {
    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Analysis API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json() as WasteAnalysisResponse;
      return result;
    } catch (error) {
      console.error('Waste analysis failed:', error);
      throw new Error(`Failed to analyze waste: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();