import React, { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { askWasteAgent } from '../lib/relevanceAgent';

interface WasteConciergeProps {
  onClose: () => void;
  onGoToCamera: () => void;
  onGoToHouseholdHub: () => void;
  onGoToFindBin: () => void;
}

interface Message {
  id: number;
  role: 'agent' | 'user';
  content: string;
  typing?: boolean;
}

const WELCOME: Message = {
  id: 0,
  role: 'agent',
  content:
    "What would you like to do next? You can tap one of the options above or ask me anything about your food waste.",
};

let msgId = 1;

export const WasteConcierge: React.FC<WasteConciergeProps> = ({
  onClose,
  onGoToCamera,
  onGoToHouseholdHub,
  onGoToFindBin,
}) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput('');
    setBusy(true);

    const userMsg: Message = { id: msgId++, role: 'user', content: trimmed };
    const typingMsg: Message = { id: msgId++, role: 'agent', content: '', typing: true };

    setMessages((prev) => [...prev, userMsg, typingMsg]);

    try {
      const reply = await askWasteAgent(trimmed);
      setMessages((prev) =>
        prev
          .filter((m) => !m.typing)
          .concat({ id: msgId++, role: 'agent', content: reply })
      );
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => !m.typing)
          .concat({
            id: msgId++,
            role: 'agent',
            content: "Sorry, I'm having trouble connecting right now. Try again in a moment!",
          })
      );
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send(input);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-2xl flex flex-col"
        style={{
          background: 'rgba(0, 17, 35, 0.90)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(87, 235, 221, 0.25)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(87,235,221,0.08)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(87,235,221,0.15)', border: '1px solid rgba(87,235,221,0.3)' }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: '#57ebdd' }} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">Waste Concierge</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.2)' }}
          >
            <X className="w-4 h-4" style={{ color: '#57ebdd' }} />
          </button>
        </div>

        {/* Preset action buttons */}
        <div className="flex flex-col gap-2.5 px-6 pb-4 flex-shrink-0">
          <button
            onClick={() => { onClose(); onGoToCamera(); }}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
            style={{ background: 'rgba(0,17,35,0.6)', border: '1.5px solid rgba(87,235,221,0.5)' }}
          >
            Snap next Waste Item
          </button>
          <button
            onClick={() => { onClose(); onGoToHouseholdHub(); }}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
            style={{ background: 'rgba(0,17,35,0.6)', border: '1.5px solid rgba(87,235,221,0.5)' }}
          >
            Go to Household Hub
          </button>
          <button
            onClick={() => { onClose(); onGoToFindBin(); }}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
            style={{ background: 'rgba(0,17,35,0.6)', border: '1.5px solid rgba(87,235,221,0.5)' }}
          >
            Find | Unlock Smart Bin
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 flex-shrink-0" style={{ height: '1px', background: 'rgba(87,235,221,0.12)' }} />

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 min-h-0" style={{ minHeight: '160px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.typing ? (
                <div
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
                  style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.2)' }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block w-2 h-2 rounded-full"
                      style={{
                        background: '#57ebdd',
                        animation: `typingDot 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              ) : msg.role === 'user' ? (
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed font-medium"
                  style={{ background: '#57ebdd', color: '#001123' }}
                >
                  {msg.content}
                </div>
              ) : (
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%] text-sm leading-relaxed text-white"
                  style={{ background: 'rgba(87,235,221,0.1)', border: '1px solid rgba(87,235,221,0.2)' }}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(87,235,221,0.12)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Waste Concierge..."
            disabled={busy}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(87,235,221,0.25)',
              borderRadius: '12px',
              padding: '10px 14px',
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#57ebdd' }}
          >
            <Send className="w-4 h-4" style={{ color: '#001123' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
