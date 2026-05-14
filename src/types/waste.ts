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

export interface WasteAnalysisResult {
  wasteType: string;
  recyclable: boolean;
  confidence: number;
  instructions: string;
  environmentalImpact: string;
  alternatives?: string[];
}

export interface WasteItem {
  itemName: string;
  wasteTypeTags: string[];
  wasteMaterial: string;
  disposalCategory: string;
  disposalGuidance: string[];
  mapSearchTerm: string;
  confidenceScore: number;
  fixResultsOption: boolean;
  agentHandleEligible: boolean;
}

export interface WasteAnalysisResponse {
  items: WasteItem[];
}

export interface AnalysisSession {
  id: string;
  snapId: string;
  result: WasteAnalysisResponse;
  timestamp: number;
}