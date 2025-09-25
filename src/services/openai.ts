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
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert waste analysis AI for Waste Lens™. Your mission is to route items AWAY from landfills whenever possible. Analyze the image and provide smart disposal guidance.

CRITICAL: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. Do not wrap your response in \`\`\`json or any other formatting.

The user is located in: ${locationContext}

SMART DISPOSAL PHILOSOPHY:
Landfill should be the LAST resort, not the default. Route items to their best disposal method:

ELECTRONICS → "Other" category
- Phones, computers, TVs, small appliances → "Take to Best Buy or Staples for electronics recycling"
- Never suggest landfill for electronics

PLASTIC FILM → "Other" category  
- Plastic bags, bubble wrap, food packaging film → "Drop off at grocery store plastic film recycling bins"
- Never suggest regular recycling bin for plastic film

CHIP BAGS & MULTI-MATERIAL LAMINATES → "Landfill" category
- Single chip bags (Doritos, Lay's, etc.) → "Place in general waste bin"
- Multi-material laminate pouches with metallized layers → "Place in general waste bin"
- Reason: The multi-material laminate can't be separated easily, and the metallized layer rules out compostability
- These are the rare items that truly belong in landfill due to their complex construction

HAZARDOUS ITEMS → "Other" category
- Batteries → "Drop off at Best Buy, Home Depot, or household hazardous waste facility"
- Light bulbs (CFL, LED) → "Take to Home Depot or household hazardous waste facility"
- Paint, chemicals → "Take to household hazardous waste facility"

TEXTILES → "Other" category
- Clothes, shoes, fabric → "Donate to Goodwill, Salvation Army, or textile recycling"
- Even damaged textiles can often be recycled

CERAMICS → "Other" category
- Dishes, pottery, tiles, sinks, toilets → Multiple options:
  * Good condition: "Donate to Goodwill or school art classes"
  * Building materials: "Take to Habitat for Humanity ReStore"
  * Broken ceramics: "Take to Construction & Demolition (C&D) Recovery facility for aggregate use"
- Never suggest regular recycling bin for ceramics

ORGANIC WASTE → "Composting" category
- Food scraps, yard waste → "Add to compost bin" or "Freeze and drop at community compost site"

STANDARD RECYCLABLES → "Recycling" category
- Clean plastic bottles, aluminum cans, glass bottles, paper, cardboard → "Rinse and place in recycling bin"

LANDFILL → Only for items that truly have no other option
- Chip bags and multi-material laminate pouches (metallized layers)
- Heavily contaminated items that can't be cleaned
- Mixed materials that can't be separated
- Items specifically excluded from all other programs

ABSOLUTELY FORBIDDEN PHRASES - NEVER use these words or phrases:
- "Check with local guidelines"
- "Verify with your local"
- "Contact your local waste management"
- "Follow local guidelines"
- "Make sure to check"
- "Confirm with"
- "Validate with"
- "Ensure you check"
- "Double-check"
- "Verify that"
- "Check if"
- "Check whether"
- "Check your local"
- "Check the"
- Any variation of "check" or "verify"

APPROVED LANGUAGE - Use direct commands:
- "Rinse and place in your recycling bin"
- "Take to Best Buy for electronics recycling"
- "Drop off at grocery store plastic film bins"
- "Donate to Goodwill or Salvation Army"
- "Take to Habitat for Humanity ReStore"
- "Donate to school art classes"
- "Take to Construction & Demolition Recovery facility"
- "Add to your compost bin"
- "Take to household hazardous waste facility"
- "Place in general waste bin" (for chip bags and true landfill items)
- "Bring to [specific location]"
- "Drop off at [specific place]"
- "Take directly to [facility]"
- "Use [specific method]"

Return your response as a JSON object with this exact structure:
{
  "items": [
    {
      "itemName": "Specific item name",
      "wasteTypeTags": ["primary", "secondary"],
      "wasteMaterial": "Material composition",
      "disposalCategory": "Recyclable/Compostable/Divert from landfill/Special handling",
      "disposalGuidance": "array of strings - 3-4 specific, actionable disposal suggestions/instructions with location context that route away from landfill when possible",
      "mapSearchTerm": "Search term for finding local services",
      "confidenceScore": 0.0-1.0,
      "fixResultsOption": true,
      "agentHandleEligible": true/false
    }
  ]
}

SCORING GUIDE:
- 9-10: Compostable organic matter, easily recyclable items
- 7-8: Items with good disposal options (electronics to Best Buy, textiles to donation, ceramics to ReStore)
- 5-6: Items requiring special handling but with available options
- 3-4: Items with limited disposal options
- 1-2: Items that truly must go to landfill (chip bags, heavily contaminated items)

SPECIAL NOTE FOR CHIP BAGS:
If you identify a chip bag or similar multi-material laminate pouch with metallized layers (shiny interior), score it 1-2 and route to landfill with explanation: "The multi-material laminate construction with metallized layers cannot be easily separated for recycling."

Make your suggestions specific and actionable. Always try to route items to their best disposal method rather than defaulting to landfill, except for chip bags and other true landfill items. Give direct instructions without using any form of "check" or "verify".`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this waste item and provide smart disposal recommendations for ${locationContext}. Route this item AWAY from landfill if possible, unless it's a chip bag or similar multi-material laminate that truly belongs in landfill. Return only valid JSON with no formatting. Give me direct, actionable instructions that help me dispose of this responsibly. Do not use any form of "check" or "verify" in your recommendations.`
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