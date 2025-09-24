import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <h1 className="text-hero font-bold text-secondary-white mb-6">
          Waste Lens™
        </h1>
        <p className="text-subheading text-secondary-gold mb-8 max-w-md">
          Snap your trash. Our Waste Agents handle the rest.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;