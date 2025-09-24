import { useState } from 'react';
import { openAIService } from '../services/_openai.ts';
import { WasteAnalysisResult, LocationData } from '../types/waste';

export const useWasteAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeWaste = async (imageData: string, location?: LocationData): Promise<WasteAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    // console.log('📸 [useWasteAnalysis] analyzeWaste()', { 
    //   videoElement: !!videoRef.current,
    //   videoSrcObject: !!videoRef.current?.srcObject
    // });

    // %%%
    try {
      const result = await openAIService.analyzeWasteImage(imageData, location);
      setAnalysisResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Waste analysis error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return {
    isAnalyzing,
    analysisResult,
    error,
    analyzeWaste,
    clearAnalysis,
  };
};