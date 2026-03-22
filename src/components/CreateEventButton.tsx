import { Plus } from 'lucide-react';

interface CreateEventButtonProps {
  onClick?: () => void;
}

export function CreateEventButton({ onClick }: CreateEventButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full h-11 bg-accent hover:bg-accent-hover text-white font-medium px-5 rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all duration-200 animate-fade-in"
      style={{
        animationDelay: '200ms',
        boxShadow: '0 4px 20px -4px rgba(212,119,92,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <Plus className="w-4 h-4" strokeWidth={2} />
      <span>Create Event</span>
    </button>
  );
}
