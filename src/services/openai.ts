import { WasteAnalysisResponse, LocationData } from '../types/waste';

export class OpenAIService {
  private apiKey: string;

  constructor() {
    // Get API key from environment variable
    this.apiKey = (import.meta.env?.VITE_OPENAI_API_KEY as string) || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Analysis features will not work.');
    }
  }

  async analyzeWasteImage(imageData: string, location?: LocationData): Promise<WasteAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.');
    }

    try {
      const locationContext = location 
        ? `User location: Latitude ${location.latitude}, Longitude ${location.longitude}. Please provide location-specific disposal guidance based on this location's waste management rules and available services.`
        : 'Location not available. Provide general disposal guidance.';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You are the Analyze GPT Agent for Waste Lens™. Analyze this waste image and provide location-specific, zero-waste disposal guidance.

                  ${locationContext}

                  CRITICAL REQUIREMENTS:
                  - Reference exact city/county-level waste rules when possible
                  - NEVER suggest vague actions like "check local rules" or "look it up"
                  - Always provide a clear path forward
                  - If local options don't exist, suggest third-party services
                  - Recognize multiple items separately if present
                  - Use only top-level waste tags (plastic, food, metal, textile, etc.)
                  - For mail-in eligible items, set agentHandleEligible: true

                  Return ONLY valid JSON in this exact structure:
                  {
                    "items": [
                      {
                        "itemName": "Specific item name",
                        "wasteTypeTags": ["primary", "secondary"],
                        "wasteMaterial": "Material composition",
                        "disposalCategory": "Recyclable/Compostable/Divert from landfill/Special handling",
                        "disposalGuidance": "Specific, actionable instructions with location context",
                        "mapSearchTerm": "Search term for finding local services",
                        "confidenceScore": 0.0-1.0,
                        "fixResultsOption": true,
                        "agentHandleEligible": true/false
                      }
                    ]
                  }

                  Focus on accuracy and provide actionable, location-specific guidance.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse JSON response
      let result: WasteAnalysisResponse;
      try {
        // Clean the content by removing potential markdown code blocks and trimming whitespace
        const cleanedContent = content
          .trim()
          .replace(/^```json\s*/, '')  // Remove opening ```json
          .replace(/^```\s*/, '')      // Remove opening ```
          .replace(/\s*```$/, '')      // Remove closing ```
          .trim();
        
        result = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        // Fallback if JSON parsing fails
        result = {
          items: [{
            itemName: 'Unknown item',
            wasteTypeTags: ['unknown'],
            wasteMaterial: 'Unable to determine',
            disposalCategory: 'Special handling',
            disposalGuidance: 'Unable to analyze this item. Please try taking another photo with better lighting.',
            mapSearchTerm: 'waste disposal near me',
            confidenceScore: 0.1,
            fixResultsOption: true,
            agentHandleEligible: false
          }]
        };
      }

      return result;
    } catch (error) {
      console.error('Waste analysis failed:', error);
      throw new Error(`Failed to analyze waste: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();