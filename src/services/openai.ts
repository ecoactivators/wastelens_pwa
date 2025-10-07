import { WasteAnalysisResponse, LocationData } from '../types/waste';
import {SYSTEM_AI_PROMPT, USER_AI_PROMPT} from "../constants/aiPrompts.ts";
import {populateTemplate} from "../utils/stringTemplateUtils.ts";
import {logMessage} from "../utils/logUtils.ts";

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
      
      const systemAIPromptArgs = [locationContext];
      const systemAIPromptPopulated = populateTemplate(SYSTEM_AI_PROMPT, systemAIPromptArgs);
      logMessage(systemAIPromptPopulated);

      const userAIPromptArgs = [locationContext];
      const userAIPromptPopulated = populateTemplate(USER_AI_PROMPT, userAIPromptArgs);
      logMessage(userAIPromptPopulated);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemAIPromptPopulated
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userAIPromptPopulated
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        // Fallback if JSON parsing fails
        result = {
          items: [{
            itemName: 'Unknown item',
            wasteTypeTags: ['unknown'],
            wasteMaterial: 'Unable to determine',
            disposalCategory: 'Special handling',
            disposalGuidance: ['Unable to analyze this item. Please try taking another photo with better lighting.'],
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