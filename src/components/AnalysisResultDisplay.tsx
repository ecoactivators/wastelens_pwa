import React, { useState, useRef, useEffect } from 'react';
import { MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UpgradePrompt } from './UpgradePrompt';
import { WasteAnalysisResponse } from '../types/waste';

interface AnalysisResultDisplayProps {
  isAnalyzing: boolean;
  analysisResult: WasteAnalysisResponse | null;
  error: string | null;
  capturedImage: string | null;
  onClearAnalysis: () => void;
  onOpenFindBin?: () => void;
  onOpenUpgradePrompt?: () => void;
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({
  isAnalyzing,
  analysisResult,
  error,
  capturedImage,
  onClearAnalysis,
  onOpenFindBin,
  onOpenUpgradePrompt,
}) => {
  const { signOut } = useAuth();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [cardHeight, setCardHeight] = useState(33.33);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(33.33);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(cardHeight);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = startY - clientY;
    const screenHeight = window.innerHeight;
    const deltaPercent = (deltaY / screenHeight) * 100;
    let newHeight = startHeight + deltaPercent;
    newHeight = Math.max(15, Math.min(85, newHeight));
    setCardHeight(newHeight);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardHeight < 25) {
      setCardHeight(20);
    } else if (cardHeight < 50) {
      setCardHeight(33.33);
    } else {
      setCardHeight(75);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleEnd();
  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientY);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      onClearAnalysis();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const openUpgrade = () => {
    if (onOpenUpgradePrompt) {
      onOpenUpgradePrompt();
    } else {
      setShowUpgradePrompt(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleMouseUp = () => handleEnd();
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
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ WebkitUserDrag: 'none', userSelect: 'none', touchAction: 'none' } as React.CSSProperties}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {capturedImage && (
        <div className="fixed inset-0 w-full h-full z-0">
          <img src={capturedImage} alt="Captured waste" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(0,17,35,0.4)' }} />
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        {analysisResult && (
          <div className="fixed top-6 left-6 group pointer-events-auto">
            <button
              onClick={onClearAnalysis}
              className="w-12 h-12 backdrop-blur-sm border-2 border-primary-accent-cyan rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ background: 'rgba(0,17,35,0.7)' }}
            >
              <ArrowLeft className="w-5 h-5 text-primary-accent-cyan" />
            </button>
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,17,35,0.85)' }}>
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-secondary-white mb-2">Analyzing with AI</h2>
          </div>
        </div>
      )}

      {error && !isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,17,35,0.85)' }}>
          <div className="text-center animate-fade-in">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-white mb-2">Analysis Failed</h2>
            <p className="text-secondary-gold mb-6">{error}</p>
            <button onClick={onClearAnalysis} className="btn-primary">Try Again</button>
          </div>
        </div>
      )}

      {analysisResult && !isAnalyzing && !error && (
        <div
          ref={cardRef}
          className={`fixed bottom-0 left-0 right-0 z-20 flex flex-col rounded-t-3xl ${isDragging ? '' : 'transition-all duration-300 ease-out'}`}
          style={{
            height: `${cardHeight}vh`,
            background: 'rgba(0, 17, 35, 0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(87, 235, 221, 0.18)',
            borderBottom: 'none',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.5)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-12 h-1 rounded-full cursor-grab active:cursor-grabbing" style={{ background: 'rgba(87,235,221,0.35)' }} />
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar px-5">
            <div className="space-y-4 pb-6">
              {analysisResult.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(0,48,86,0.45)',
                    border: '1px solid rgba(87,235,221,0.15)',
                  }}
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-white">{item.itemName}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full"
                      style={{ background: 'rgba(87,235,221,0.18)', color: '#57ebdd', border: '1px solid rgba(87,235,221,0.3)' }}
                    >
                      {item.disposalCategory}
                    </span>
                    {item.wasteTypeTags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{ background: 'rgba(87,235,221,0.18)', color: '#57ebdd', border: '1px solid rgba(87,235,221,0.3)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <ul className="space-y-1.5">
                      {item.disposalGuidance.map((guidance, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#57ebdd' }} />
                          <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{guidance}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(item.mapSearchTerm)}`;
                      window.open(searchUrl, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(87,235,221,0.1)',
                      border: '1px solid rgba(87,235,221,0.3)',
                      color: '#57ebdd',
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Find Locations</span>
                  </button>
                </div>
              ))}

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={openUpgrade}
                    className="flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(87,235,221,0.1)',
                      border: '1.5px solid rgba(87,235,221,0.5)',
                      color: '#57ebdd',
                    }}
                  >
                    Household Hub
                  </button>

                  <button
                    onClick={() => onOpenFindBin ? onOpenFindBin() : undefined}
                    className="flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(87,235,221,0.1)',
                      border: '1.5px solid rgba(87,235,221,0.5)',
                      color: '#57ebdd',
                    }}
                  >
                    Smart Bins
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center py-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          onSuccess={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};
