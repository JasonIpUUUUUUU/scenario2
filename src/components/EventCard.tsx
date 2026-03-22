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
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div
      className={`h-full ${event.colors.bg} rounded-xl p-2.5 cursor-pointer border-l-[3px] ${event.colors.border} relative overflow-hidden flex flex-col justify-between transition-all duration-200 hover:brightness-110`}
    >
      {/* Title */}
      <div>
        <h3 className={`font-semibold ${event.colors.text} text-[11px] leading-tight`}>
          {event.title}
        </h3>
      </div>

      {/* Face Pile */}
      <div className="flex items-center justify-end">
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
