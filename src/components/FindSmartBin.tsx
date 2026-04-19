import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
const L = (window as any).L;

interface SmartBinLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  active: boolean;
}

const BIN_LOCATIONS: SmartBinLocation[] = [
  { id: '1', name: 'Broadway at the Beach', address: '1325 Celebrity Circle, Myrtle Beach, SC 29577', lat: 33.7876, lng: -78.8614, active: true },
  { id: '2', name: 'Myrtle Beach Convention Center', address: '2101 N Oak St, Myrtle Beach, SC 29577', lat: 33.7590, lng: -78.8434, active: true },
  { id: '3', name: 'Coastal Grand Mall', address: '2000 Coastal Grand Cir, Myrtle Beach, SC 29577', lat: 33.7279, lng: -78.8842, active: true },
  { id: '4', name: 'Market Common', address: '4017 Deville St, Myrtle Beach, SC 29577', lat: 33.6835, lng: -78.9271, active: true },
  { id: '5', name: 'Valor Park', address: 'Valor Park Dr, Myrtle Beach, SC 29579', lat: 33.6893, lng: -78.9198, active: true },
];

const cyanIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#57ebdd"/><circle cx="12" cy="12" r="5" fill="#001123"/></svg>`;

const cyanIcon = L.divIcon({
  html: cyanIconSvg,
  className: '',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -42],
});

type Step = 'map' | 'detail' | 'unlock';

interface FindSmartBinProps {
  onBack: () => void;
  onUnlockComplete: () => void;
}

interface LeafletMapProps {
  onSelectBin: (bin: SmartBinLocation) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ onSelectBin }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [33.7376, -78.8814],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    BIN_LOCATIONS.forEach((bin) => {
      const marker = L.marker([bin.lat, bin.lng], { icon: cyanIcon }).addTo(map);
      marker.bindPopup(
        `<div style="min-width:140px;font-family:sans-serif">
          <p style="font-weight:700;color:#001123;margin:0 0 8px">${bin.name}</p>
          <button onclick="window.__selectBin('${bin.id}')" style="background:#57ebdd;color:#001123;border:none;border-radius:8px;padding:6px 12px;font-weight:600;cursor:pointer;font-size:13px;width:100%">View Details</button>
        </div>`,
        { closeButton: false }
      );
    });

    (window as unknown as Record<string, unknown>).__selectBin = (id: string) => {
      const bin = BIN_LOCATIONS.find((b) => b.id === id);
      if (bin) onSelectBin(bin);
    };

    leafletMap.current = map;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
      delete (window as unknown as Record<string, unknown>).__selectBin;
    };
  }, [onSelectBin]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export const FindSmartBin: React.FC<FindSmartBinProps> = ({ onBack, onUnlockComplete }) => {
  const [step, setStep] = useState<Step>('map');
  const [selectedBin, setSelectedBin] = useState<SmartBinLocation | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [progress, setProgress] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 'unlock') {
      setCountdown(20);
      setProgress(1);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          setProgress(next / 20);
          if (next <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            onUnlockComplete();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, onUnlockComplete]);

  const handleSelectBin = (bin: SmartBinLocation) => {
    setSelectedBin(bin);
    setStep('detail');
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  if (step === 'unlock' && selectedBin) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: '#001123' }}>
        <div className="flex flex-col items-center gap-8 px-8">
          <div
            className="w-48 h-48 rounded-full overflow-hidden flex items-center justify-center"
            style={{ boxShadow: '0 0 60px rgba(87,235,221,0.5), 0 0 120px rgba(87,235,221,0.2)', animation: 'binPulse 2s ease-in-out infinite' }}
          >
            <img
              src="/Bin_Picture_3_(1).png"
              alt="Smart Bin"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                if (el.parentElement) el.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem">♻</div>`;
              }}
            />
          </div>

          <p className="text-white text-center text-lg font-medium leading-relaxed">
            Smart Bin will remain unlocked for 20 seconds
          </p>

          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(87,235,221,0.15)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius} fill="none"
                stroke="#57ebdd" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <span className="text-white text-3xl font-bold z-10">{countdown}</span>
          </div>
        </div>

        <style>{`
          @keyframes binPulse {
            0%, 100% { box-shadow: 0 0 60px rgba(87,235,221,0.5), 0 0 120px rgba(87,235,221,0.2); }
            50% { box-shadow: 0 0 80px rgba(87,235,221,0.8), 0 0 160px rgba(87,235,221,0.35); }
          }
        `}</style>
      </div>
    );
  }

  if (step === 'detail' && selectedBin) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#001123' }}>
        <div className="flex items-center gap-4 px-5 pt-8 pb-4">
          <button
            onClick={() => setStep('map')}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.3)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#57ebdd' }} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{selectedBin.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedBin.address}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-5 pb-8 gap-5 overflow-y-auto">
          <div
            className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: 'rgba(87,235,221,0.05)', border: '1px solid rgba(87,235,221,0.15)', minHeight: '220px' }}
          >
            <img
              src="/Bin_Picture_3_(1).png"
              alt="Smart Bin"
              className="w-full object-cover rounded-2xl"
              style={{ maxHeight: '300px' }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                if (el.parentElement) el.parentElement.innerHTML = `<div style="width:100%;height:220px;display:flex;align-items:center;justify-content:center;color:#57ebdd;font-size:4rem">♻</div>`;
              }}
            />
          </div>

          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.2)' }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#57ebdd' }} />
            <span className="text-sm font-medium" style={{ color: '#57ebdd' }}>Active — Ready to accept waste</span>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setStep('unlock')}
              className="w-full py-4 rounded-full text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#57ebdd', color: '#001123' }}
            >
              Unlock Smart Bin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#001123' }}>
      <div className="flex items-center gap-4 px-5 pt-8 pb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
          style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.3)' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#57ebdd' }} />
        </button>
        <h1 className="text-lg font-bold text-white">Find Smart Bin</h1>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative" style={{ minHeight: '45vh', maxHeight: '55vh' }}>
          <LeafletMap onSelectBin={handleSelectBin} />
        </div>

        <div
          className="flex-shrink-0 flex flex-col pb-6"
          style={{ background: 'rgba(0,17,35,0.97)', borderTop: '1px solid rgba(87,235,221,0.15)' }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <span className="text-white font-semibold text-sm">Near You</span>
            <button className="text-xs font-medium" style={{ color: '#57ebdd' }}>See All</button>
          </div>

          <div className="overflow-x-auto px-5" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-3" style={{ width: 'max-content' }}>
              {BIN_LOCATIONS.map((bin) => (
                <button
                  key={bin.id}
                  onClick={() => handleSelectBin(bin)}
                  className="flex flex-col rounded-2xl overflow-hidden text-left flex-shrink-0 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    width: '140px',
                    background: 'rgba(0,48,86,0.6)',
                    border: '1px solid rgba(87,235,221,0.2)',
                    backdropFilter: 'blur(12px)',
                    opacity: bin.active ? 1 : 0.5,
                  }}
                >
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-xs font-semibold" style={{ color: bin.active ? '#57ebdd' : 'rgba(255,255,255,0.5)' }}>
                      {bin.active ? 'Nearby' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mx-3 rounded-xl overflow-hidden flex items-center justify-center" style={{ height: '72px', background: 'rgba(87,235,221,0.05)' }}>
                    <img
                      src="/Bin_Picture_3_(1).png"
                      alt="Smart Bin"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        if (el.parentElement) el.parentElement.innerHTML = `<span style="font-size:2rem;color:#57ebdd">♻</span>`;
                      }}
                    />
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-white text-xs font-bold leading-snug">{bin.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; }
        .leaflet-popup-content { margin: 12px; }
      `}</style>
    </div>
  );
};
