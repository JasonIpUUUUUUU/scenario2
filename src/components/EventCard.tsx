import { X } from 'lucide-react';

interface Attendee {
  name: string;
  initials: string;
  color: string;
}

interface EventColors {
  bg: string;
  text: string;
  border: string;
}

interface Event {
  id: string;
  title: string;
  color: string;
  attendees: Attendee[];
  colors: EventColors;
  isCurrent?: boolean;
}

interface EventCardProps {
  event: Event;
  onDelete?: (e: React.MouseEvent) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  return (
    <div
      className={`h-full ${event.colors.bg} rounded-xl p-2 cursor-pointer border-l-[3px] ${event.colors.border} relative overflow-hidden flex flex-col justify-between transition-all duration-200 hover:brightness-110 group ${
        event.isCurrent ? 'ring-2 ring-accent/50' : ''
      }`}
    >
      {/* Delete button - appears on hover */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500/80 z-10"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
      
      {/* Title */}
      <div className="pr-5">
        <h3 className={`font-semibold ${event.colors.text} text-[11px] leading-tight truncate`}>
          {event.title}
        </h3>
      </div>

      {/* Face Pile */}
      <div className="flex items-center justify-end mt-1">
        {event.attendees.slice(0, 3).map((attendee, index) => (
          <div
            key={attendee.name}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium text-white/90"
            style={{
              backgroundColor: attendee.color,
              marginLeft: index > 0 ? '-5px' : '0',
              zIndex: event.attendees.length - index,
              border: '1.5px solid rgba(0,0,0,0.3)',
            }}
            title={attendee.name}
          >
            {attendee.initials}
          </div>
        ))}
        {event.attendees.length > 3 && (
          <div
            className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-[8px] font-medium text-text-secondary"
            style={{ marginLeft: '-5px', zIndex: 0, border: '1.5px solid rgba(0,0,0,0.3)' }}
          >
            +{event.attendees.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}