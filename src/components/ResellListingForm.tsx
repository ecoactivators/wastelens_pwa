import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface ResellListingFormProps {
  onClose: () => void;
}

export const ResellListingForm: React.FC<ResellListingFormProps> = ({ onClose }) => {
  const [listPrice, setListPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [priority, setPriority] = useState(50);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'meta'>('paypal');

  const serviceFee = salePrice ? (parseFloat(salePrice) * 0.2).toFixed(2) : '0';
  const youReceive = salePrice ? (parseFloat(salePrice) * 0.8).toFixed(2) : '0';

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    { label: 'AM', time: '(8-11)' },
    { label: 'MID', time: '(11-3)' },
    { label: 'PM', time: '(4-9)' }
  ];

  const toggleTimeSlot = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setSelectedTimeSlots(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  return (
    <div className="fixed inset-0 bg-primary-bg z-50 overflow-y-auto">
      <div className="min-h-screen p-6 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-primary-accent-cyan hover:bg-primary-accent-cyan/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-accent-cyan" />
          </button>
          <h1 className="text-lg font-semibold text-secondary-white">Resell Listing</h1>
          <div className="w-10"></div>
        </div>

        {/* Section 1: Photos & Media */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-primary-accent-cyan mb-4 tracking-wide">
            1 • PHOTOS & MEDIA
          </h2>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="aspect-square rounded-xl border-2 border-primary-accent-cyan/30 bg-primary-bg flex items-center justify-center hover:border-primary-accent-cyan/50 transition-colors cursor-pointer"
              >
                <span className="text-secondary-gold text-2xl font-light">{num}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="aspect-square rounded-xl border-2 border-primary-accent-pink bg-primary-bg flex items-center justify-center hover:border-primary-accent-pink/70 transition-colors cursor-pointer">
              <span className="text-primary-accent-pink text-sm font-medium">+ Add</span>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={includeVideo}
                onChange={(e) => setIncludeVideo(e.target.checked)}
                className="w-6 h-6 rounded-full appearance-none border-2 border-secondary-gold/40 checked:bg-secondary-gold checked:border-secondary-gold cursor-pointer transition-all"
              />
              {includeVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-3 bg-primary-bg rounded-full"></div>
                </div>
              )}
            </div>
            <span className="text-secondary-gold text-sm">Include short video (optional)</span>
          </label>
        </div>

        {/* Section 2: Pricing */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-primary-accent-cyan mb-4 tracking-wide">
            2 • PRICING
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-secondary-gold mb-2">List price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-gold">$</span>
                <input
                  type="number"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="w-full bg-transparent border border-secondary-gold/30 rounded-lg px-8 py-3 text-secondary-white focus:border-primary-accent-cyan focus:outline-none transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-secondary-gold mb-2">Sale price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-gold">$</span>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full bg-transparent border border-secondary-gold/30 rounded-lg px-8 py-3 text-secondary-white focus:border-primary-accent-cyan focus:outline-none transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="px-4 py-2 bg-primary-accent-cyan/10 border border-primary-accent-cyan/30 rounded-full">
              <span className="text-xs text-primary-accent-cyan font-medium">
                20% service fee: ${serviceFee}
              </span>
            </div>
            <div className="px-4 py-2 bg-primary-accent-cyan/10 border border-primary-accent-cyan/30 rounded-full">
              <span className="text-xs text-primary-accent-cyan font-medium">
                You receive: ${youReceive}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-secondary-gold mb-3">Priority</label>
            <input
              type="range"
              min="0"
              max="100"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary-gold/20 rounded-full appearance-none cursor-pointer priority-slider"
              style={{
                background: `linear-gradient(to right, #1ed0f3 0%, #1ed0f3 ${priority}%, rgba(233, 210, 155, 0.2) ${priority}%, rgba(233, 210, 155, 0.2) 100%)`
              }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-secondary-gold/60">0 = Max $$</span>
              <span className="text-xs text-secondary-gold/60">100 = Fastest sale</span>
            </div>
          </div>
        </div>

        {/* Section 3: Pickup Window & Location */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-primary-accent-cyan mb-4 tracking-wide">
            3 • PICKUP WINDOW & LOCATION
          </h2>

          <div className="mb-6">
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div></div>
              {days.map((day) => (
                <div key={day} className="text-center">
                  <span className="text-xs text-secondary-gold font-medium">{day}</span>
                </div>
              ))}
            </div>

            {timeSlots.map((slot) => (
              <div key={slot.label} className="grid grid-cols-8 gap-1 mb-1">
                <div className="flex items-center justify-center">
                  <div className="text-xs text-secondary-gold">
                    <div className="font-medium">{slot.label}</div>
                    <div className="text-[10px] opacity-60">{slot.time}</div>
                  </div>
                </div>
                {days.map((day) => {
                  const key = `${day}-${slot.label}`;
                  const isSelected = selectedTimeSlots.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleTimeSlot(day, slot.label)}
                      className={`aspect-square rounded border transition-colors ${
                        isSelected
                          ? 'bg-primary-accent-cyan/20 border-primary-accent-cyan text-primary-accent-cyan'
                          : 'bg-transparent border-secondary-gold/20 text-secondary-gold/40 hover:border-secondary-gold/40'
                      }`}
                    >
                      <span className="text-sm">{isSelected ? '✓' : '—'}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-secondary-gold mb-2">Pickup location</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full bg-transparent border border-secondary-gold/30 rounded-lg px-4 py-3 text-secondary-white placeholder-secondary-gold/40 focus:border-primary-accent-cyan focus:outline-none transition-colors"
              placeholder="At residence or meet-up spot"
            />
          </div>
        </div>

        {/* Section 4: Payout Method */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-primary-accent-cyan mb-4 tracking-wide">
            4 • PAYOUT METHOD
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`px-5 py-3 rounded-full border-2 transition-all ${
                paymentMethod === 'paypal'
                  ? 'bg-primary-accent-cyan/10 border-primary-accent-cyan text-primary-accent-cyan'
                  : 'bg-transparent border-secondary-gold/30 text-secondary-gold hover:border-secondary-gold/50'
              }`}
            >
              <span className="text-sm font-medium">PayPal • Connected</span>
            </button>

            <button
              onClick={() => setPaymentMethod('meta')}
              className={`px-5 py-3 rounded-full border-2 transition-all ${
                paymentMethod === 'meta'
                  ? 'bg-primary-accent-cyan/10 border-primary-accent-cyan text-primary-accent-cyan'
                  : 'bg-transparent border-secondary-gold/30 text-secondary-gold hover:border-secondary-gold/50'
              }`}
            >
              <span className="text-sm font-medium">Meta Pay</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary-bg via-primary-bg to-transparent">
          <button className="w-full py-4 bg-primary-accent-pink hover:bg-primary-accent-pink/90 text-secondary-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-primary-accent-pink/30 mb-3">
            Submit listing
          </button>
          <p className="text-center text-xs text-secondary-gold/60">
            By submitting, you agree to the 20% service fee and marketplace{' '}
            <button className="underline hover:text-secondary-gold transition-colors">T&Cs</button>.
          </p>
        </div>
      </div>

      <style>{`
        .priority-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1ed0f3;
          cursor: pointer;
          border: 3px solid #001123;
          box-shadow: 0 2px 8px rgba(30, 208, 243, 0.4);
        }

        .priority-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1ed0f3;
          cursor: pointer;
          border: 3px solid #001123;
          box-shadow: 0 2px 8px rgba(30, 208, 243, 0.4);
        }
      `}</style>
    </div>
  );
};
