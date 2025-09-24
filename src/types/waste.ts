import {MapSuggestion} from "../services/maps.ts";

export interface SnapMetadata {
  id: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  imageData?: string; // base64 when captured
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface CameraPermissionState {
  granted: boolean;
  denied: boolean;
  loading: boolean;
}

export interface WasteAnalysisDisplayItem {
  wasteType: string;
  recyclable: boolean;
  confidence: number;
  instructions: string;
  environmentalImpact: string;
  alternatives?: string[];
}

export interface WasteAnalysisResultItem {
  itemName: string;
  wasteTypeTags: string[];
  wasteMaterial: string;
  disposalCategory: string;
  disposalGuidance: string;
  mapSearchTerm: string;
  confidenceScore: number;
  fixResultsOption: boolean;
  agentHandleEligible: boolean;

  suggestions: string[];
  mapSuggestions?: MapSuggestion[];
}

// interface WasteAnalysisResult {
//     itemName: string;
//     quantity: number;
//     weight: number;
//     material: string;
//     environmentScore: number;
//     recyclable: boolean;
//     compostable: boolean;
//     carbonFootprint: number;
//     suggestions: string[];
//     mapSuggestions?: MapSuggestion[];
//     confidence: number;
// }

// export interface WasteAnalysisResponse {
//   items: WasteItem[];
// }

export interface WasteAnalysisResult {
  items: WasteAnalysisResultItem[];
}

export interface AnalysisSession {
  id: string;
  snapId: string;
  result: WasteAnalysisResult;
  timestamp: number;
}