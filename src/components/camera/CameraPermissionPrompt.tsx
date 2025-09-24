import React from 'react';
import { AlertCircle, Settings } from 'lucide-react';

interface CameraPermissionPromptProps {
  onRetry: () => void;
}

export const CameraPermissionPrompt: React.FC<CameraPermissionPromptProps> = ({ onRetry }) => {
  const openDeviceSettings = () => {
    // Note: Direct settings access is limited in web browsers
    // This provides user guidance instead
    alert('Please go to your browser settings and allow camera access for this site, then refresh the page.');
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="mb-8">
          <AlertCircle className="w-16 h-16 text-primary-accent-cyan mx-auto mb-4" />
          <h2 className="text-heading font-bold text-secondary-white mb-4">
            Camera Access Required
          </h2>
          <p className="text-body text-secondary-gold leading-relaxed">
            Waste Lens™ needs your camera to snap your waste. Please provide access in your device settings.
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={openDeviceSettings}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Open Settings
          </button>
          
          <button 
            onClick={onRetry}
            className="w-full px-8 py-4 text-secondary-teal font-semibold rounded-xl border border-secondary-teal/30 hover:bg-secondary-teal/10 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};