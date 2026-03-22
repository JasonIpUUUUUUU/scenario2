import { useState, useEffect, useRef } from 'react';
import { X, MapPin, AlignLeft, Repeat, Sparkles } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Fake avatar colors for the "parsed" contacts ── */
const contactAvatars: Record<string, { color: string; initial: string }> = {
  Sam: { color: '#7a9ec4', initial: 'S' },
  Emma: { color: '#b87ba8', initial: 'E' },
};

/* ── NLP Smart Tags ── */
function SmartTag({
  icon,
  label,
  children,
  delay,
}: {
  icon?: string;
  label: string;
  children?: React.ReactNode;
  delay: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[13px] font-body text-text-primary animate-tag-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {icon && <span className="text-ev-slate text-[13px]">{icon}</span>}
      {children}
      <span className="text-text-primary font-medium">{label}</span>
    </span>
  );
}

/* ── Secondary control button ── */
function ControlButton({
  icon: Icon,
  label,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  delay: number;
}) {
  return (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200 text-[13px] animate-tag-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
      <span>{label}</span>
    </button>
  );
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = 'Dinner with Sam and Emma next Friday at 7pm';

  /* Focus input on open */
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setShowTags(false);
      setInputValue('');
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /* Simulate NLP parsing after typing stops */
  useEffect(() => {
    if (inputValue.length > 10) {
      const timer = setTimeout(() => setShowTags(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowTags(false);
    }
  }, [inputValue]);

  /* Animate-out before unmounting */
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250);
  };

  /* Keyboard shortcuts */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={handleClose}
    >
      {/* ── Backdrop: blur + dim ── */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* ── Warm ambient glow behind modal ── */}
      <div
        className="absolute w-[700px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, #d4775c 0%, #e08a6f 30%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Modal Container ── */}
      <div
        className={`relative w-[600px] rounded-[32px] border border-white/10 overflow-hidden ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
        style={{
          backgroundColor: 'rgba(26, 25, 23, 0.94)',
          boxShadow:
            '0 0 0 1px rgba(255,245,230,0.04), 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 120px -20px rgba(212,119,92,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Internal noise texture ── */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-[32px]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: '256px',
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 p-8">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold text-text-primary tracking-[-0.02em]">
                New Plan
              </h2>
              <span className="animate-tag-in" style={{ animationDelay: '400ms' }}>
                <Sparkles className="w-5 h-5 text-accent opacity-60" strokeWidth={1.5} />
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all duration-200"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* ── Smart Input ── */}
          <div className="mb-5">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="w-full bg-transparent text-xl text-text-primary placeholder:text-text-muted font-body font-light resize-none outline-none leading-relaxed caret-accent"
              style={{ caretColor: '#d4775c' }}
            />
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-white/[0.06] mb-5" />

          {/* ── NLP Smart Tags ── */}
          <div className="min-h-[44px] mb-5">
            {showTags ? (
              <div className="flex flex-wrap items-center gap-2">
                <SmartTag icon="📅" label="Fri, Sep 12" delay={0} />
                <SmartTag icon="⏰" label="19:00 – 21:00" delay={80} />
                <SmartTag label="Sam, Emma" delay={160}>
                  <span className="flex -space-x-1.5 mr-1">
                    {Object.entries(contactAvatars).map(([name, { color, initial }]) => (
                      <span
                        key={name}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white border-[1.5px] border-[#1a1917]"
                        style={{ backgroundColor: color }}
                      >
                        {initial}
                      </span>
                    ))}
                  </span>
                </SmartTag>
              </div>
            ) : (
              <p className="text-[13px] text-text-muted flex items-center gap-2 animate-tag-in">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                Start typing to see smart suggestions…
              </p>
            )}
          </div>

          {/* ── Secondary Controls ── */}
          <div className="flex items-center gap-1 mb-8">
            <ControlButton icon={MapPin} label="Location" delay={200} />
            <ControlButton icon={AlignLeft} label="Description" delay={260} />
            <ControlButton icon={Repeat} label="Repeat" delay={320} />
          </div>

          {/* ── Action Bar ── */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="text-[14px] text-text-secondary hover:text-text-primary transition-colors duration-200 px-2 py-1"
            >
              Cancel
            </button>

            <button
              className="group relative h-12 px-7 rounded-full font-body font-semibold text-[15px] text-base transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #d4775c 0%, #e08a6f 50%, #d4a843 100%)',
                boxShadow:
                  '0 4px 24px -4px rgba(212,119,92,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <span className="flex items-center gap-3">
                <span>Create Event</span>
                <span className="flex items-center gap-1 text-[11px] font-normal opacity-60 border border-black/20 rounded-md px-1.5 py-0.5 bg-black/10">
                  <span>⏎</span>
                  <span>Enter</span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
