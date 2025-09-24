import React, { useState, useRef, useEffect } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Recycle, Trash2, Settings } from 'lucide-react';
import { WasteAnalysisResponse } from '../types/waste';

interface AnalysisResultDisplayProps {
  isAnalyzing: boolean;
  analysisResult: WasteAnalysisResponse | null;
  error: string | null;
  capturedImage: string | null;
  onClearAnalysis: () => void;
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({
  isAnalyzing,
  analysisResult,
  error,
  capturedImage,
  onClearAnalysis,
}) => {
  const [cardHeight, setCardHeight] = useState(33.33); // Start at 1/3 height (33.33%)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(33.33);
  const cardRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
      case 'recyclable (conditional)':
        return <Recycle className="w-5 h-5 text-primary-accent-cyan" />;
      case 'compostable':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'divert from landfill':
        return <CheckCircle className="w-5 h-5 text-primary-accent-pink" />;
      case 'special handling':
        return <AlertTriangle className="w-5 h-5 text-secondary-gold" />;
      default:
        return <Trash2 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryBorder = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
      case 'recyclable (conditional)':
        return 'border-primary-accent-cyan/30';
      case 'compostable':
        return 'border-green-500/30';
      case 'divert from landfill':
        return 'border-primary-accent-pink/30';
      case 'special handling':
        return 'border-primary-accent-pink/30';
      default:
        return 'border-gray-400/30';
    }
  };

  // Touch/Mouse event handlers for dragging
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(cardHeight);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;

    const deltaY = startY - clientY; // Positive when dragging up
    const screenHeight = window.innerHeight;
    const deltaPercent = (deltaY / screenHeight) * 100;
    
    let newHeight = startHeight + deltaPercent;
    
    // Constrain between 15% (mostly hidden) and 85% (mostly expanded)
    newHeight = Math.max(15, Math.min(85, newHeight));
    
    setCardHeight(newHeight);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to predefined positions based on current height
    if (cardHeight < 25) {
      // Snap to mostly hidden
      setCardHeight(20);
    } else if (cardHeight < 50) {
      // Snap to initial 1/3 position
      setCardHeight(33.33);
    } else {
      // Snap to expanded
      setCardHeight(75);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startHeight, cardHeight]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      {capturedImage && (
        <img 
          src={capturedImage} 
          alt="Captured waste" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-semibold text-white">Waste Lens™</h1>
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-secondary-white mb-2">
              Analyzing with AI
            </h2>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center animate-fade-in">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-white mb-2">
              Analysis Failed
            </h2>
            <p className="text-secondary-gold mb-6">
              {error}
            </p>
            <button
              onClick={onClearAnalysis}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Draggable Results Card */}
      {analysisResult && !isAnalyzing && !error && (
        <div
          ref={cardRef}
          className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-20 flex flex-col ${
            isDragging ? '' : 'transition-all duration-300 ease-out'
          }`}
          style={{ height: `${cardHeight}vh` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-400 rounded-full cursor-grab active:cursor-grabbing"></div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6">
            <div className="space-y-4">
              {/* Items List */}
              {analysisResult.items.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-2xl p-6 bg-white ${getCategoryBorder(item.disposalCategory)}`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(item.disposalCategory)}
                      <div>
                        <h3 className="text-lg font-semibold text-brand-dark">
                          {item.itemName}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-secondary-gold mb-1">Confidence</div>
                      <div className="text-sm font-semibold text-secondary-gold">
                        {Math.round(item.confidenceScore * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.disposalCategory.toLowerCase() === 'special handling' 
                        ? 'bg-primary-accent-pink text-secondary-white'
                        : 'bg-secondary-gold/20 text-secondary-gold'
                    }`}>
                      {item.disposalCategory}
                    </span>
                    {item.wasteTypeTags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary-accent-cyan text-secondary-white text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Disposal Guidance */}
                  <div className="mb-4">
                    <span className="text-sm text-brand-dark leading-relaxed">
                      {item.disposalGuidance}
                    </span>
                  </div>

                  {/* Find Locations Button */}
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => {
                        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(item.mapSearchTerm)}`;
                        window.open(searchUrl, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-accent-cyan/20 text-primary-accent-cyan border border-primary-accent-cyan/30 rounded-xl hover:bg-primary-accent-cyan/30 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Find Locations</span>
                    </button>
                    
                    {/* Fix Results Button */}
                    {item.fixResultsOption && (
                      <button
                        onClick={() => {
                          console.log('Fix Results triggered for:', item.itemName);
                          alert('Coming soon! You will be able to correct results.');
                        }}
                        className="px-4 py-2 bg-secondary-gold text-primary-bg font-medium rounded-lg transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 flex items-center gap-1"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-xs">Fix</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Bottom Buttons - Now embedded in scrollable content */}
              <div className="py-4 flex gap-2 px-0">
                {/* Snap Trash Button */}
                <button
                  onClick={onClearAnalysis}
                  className="btn-primary flex-1 min-w-0 px-4"
                >
                  Snap Trash
                </button>

                {/* Agent Handle Button */}
                <button
                  onClick={() => {
                    console.log('Agent Handle triggered');
                    alert('Coming soon! Agentic AI experiences. Handled for you: resale management, shipping arrangement, pick-up coordination, and much more.');
                  }}
                  className="btn-primary flex-1 min-w-0 px-4"
                >
                  Agent Handle
                </button>

                {/* Reward Hub Button */}
                <button
                  onClick={() => {
                    console.log('Reward Hub triggered');
                    alert('Coming soon! Agentic AI-orchestrated diversion. A done-for-you experience!');
                  }}
                  className="btn-primary flex-1 min-w-0 px-4"
                >
                  Activate Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};