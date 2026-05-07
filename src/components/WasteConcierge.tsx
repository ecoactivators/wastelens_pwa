import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
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

  const userBubbleStyle: React.CSSProperties = {
    background: '#57ebdd',
    color: '#001123',
    fontWeight: 500,
    borderRadius: '18px 18px 4px 18px',
    padding: '10px 14px',
    maxWidth: '75%',
    marginRight: '4px',
  };

  const agentBubbleStyle: React.CSSProperties = {
    background: 'rgba(10, 20, 35, 0.6)',
    border: '1px solid rgba(87, 235, 221, 0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: '#ffffff',
    borderRadius: '18px 18px 18px 4px',
    padding: '10px 14px',
    maxWidth: '75%',
    marginLeft: '4px',
  };

  const chipStyle: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '999px',
    background: 'rgba(0,17,35,0.6)',
    border: '1px solid rgba(87,235,221,0.35)',
    color: '#ffffff',
    whiteSpace: 'nowrap',
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
          height: '70vh',
          maxHeight: '70vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              <img src="/Waste Lens emblem (compressed).png" alt="Waste Lens" className="w-full h-full object-cover" />
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

        {/* Preset action chips */}
        <div className="flex flex-wrap px-6 flex-shrink-0" style={{ gap: '8px' }}>
          <button
            onClick={() => { onClose(); onGoToCamera(); }}
            className="transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={chipStyle}
          >
            Snap Trash
          </button>
          <button
            onClick={() => { onClose(); onGoToFindBin(); }}
            className="transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={chipStyle}
          >
            Smart Bins
          </button>
          <button
            onClick={() => { onClose(); onGoToHouseholdHub(); }}
            className="transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={chipStyle}
          >
            Rewards Hub
          </button>
        </div>

        {/* Divider */}
        <div
          className="mx-6 flex-shrink-0"
          style={{
            height: '1px',
            background: 'rgba(87, 235, 221, 0.15)',
            marginTop: '12px',
            marginBottom: '12px',
          }}
        />

        {/* Conversation */}
        <div
          className="wc-scroll flex-1 flex flex-col min-h-0"
          style={{
            overflowY: 'auto',
            padding: '16px',
            gap: '10px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.typing ? (
                <div
                  className="flex items-center gap-1.5"
                  style={agentBubbleStyle}
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
                <div className="text-sm leading-relaxed" style={userBubbleStyle}>
                  {msg.content}
                </div>
              ) : (
                <div className="text-sm leading-relaxed" style={agentBubbleStyle}>
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input pill */}
        <div className="px-4 py-4 flex-shrink-0">
          <div
            className="flex items-center"
            style={{
              background: 'rgba(10, 20, 35, 0.6)',
              border: '1px solid rgba(87, 235, 221, 0.2)',
              borderRadius: '24px',
              padding: '4px 4px 4px 16px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your Waste Concierge..."
              disabled={busy}
              className="flex-1 bg-transparent text-white text-sm outline-none wc-input"
              style={{ border: 'none', padding: '8px 0' }}
            />
            <button
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#57ebdd' }}
            >
              <Send className="w-4 h-4" style={{ color: '#001123' }} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .wc-scroll::-webkit-scrollbar { display: none; }
        .wc-input::placeholder { color: #57ebdd; opacity: 0.7; }
      `}</style>
    </div>
  );
};
