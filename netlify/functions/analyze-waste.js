exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { imageData, location } = JSON.parse(event.body);

    if (!imageData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'Image data is required' })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ 
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable in your deployment settings.' 
        })
      };
    }

    const locationContext = location 
      ? `User location: Latitude ${location.latitude}, Longitude ${location.longitude}. Please provide location-specific disposal guidance based on this location's waste management rules and available services.`
      : 'Location not available. Provide general disposal guidance.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Analysis failed:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: `Failed to analyze waste: ${error.message}` 
      })
    };
  }
};