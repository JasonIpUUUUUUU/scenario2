import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/client';
import { EventCard } from './EventCard';
import { format, parseISO, startOfWeek, addDays, eachDayOfInterval } from 'date-fns';
import { useAuthStore } from '../store/authStore';

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8);

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  'ev-terracotta': { bg: 'bg-ev-terracotta-bg', text: 'text-ev-terracotta', border: 'border-ev-terracotta' },
  'ev-sage': { bg: 'bg-ev-sage-bg', text: 'text-ev-sage', border: 'border-ev-sage' },
  'ev-gold': { bg: 'bg-ev-gold-bg', text: 'text-ev-gold', border: 'border-ev-gold' },
  'ev-slate': { bg: 'bg-ev-slate-bg', text: 'text-ev-slate', border: 'border-ev-slate' },
  'ev-plum': { bg: 'bg-ev-plum-bg', text: 'text-ev-plum', border: 'border-ev-plum' },
  'ev-teal': { bg: 'bg-ev-teal-bg', text: 'text-ev-teal', border: 'border-ev-teal' },
};

// Get random attendees based on user's name
const getAttendees = (userName?: string) => {
  const attendees = [
    { name: userName || 'You', initials: userName?.charAt(0) || 'U', color: '#d4775c' },
    { name: 'Sarah Chen', initials: 'SC', color: '#b87ba8' },
    { name: 'Mike Ross', initials: 'MR', color: '#6bbab4' },
  ];
  return attendees;
};

interface WeekViewProps {
  currentDate: Date;
}

export function WeekView({ currentDate }: WeekViewProps) {
  const { user } = useAuthStore();
  
  // Get the start of the week (Monday)
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Create array of days for the week
  const weekDays = eachDayOfInterval({
    start: startOfWeekDate,
    end: addDays(startOfWeekDate, 6),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-text-secondary">Loading calendar...</div>
      </div>
    );
  }

  // Group events by day
  const eventsByDay = data?.events.reduce((acc, event) => {
    const eventDate = parseISO(event.start_ts);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push({
      ...event,
      hour: eventDate.getHours(),
      duration: (parseISO(event.end_ts).getHours() - eventDate.getHours()) || 1,
      color: ['ev-terracotta', 'ev-sage', 'ev-gold', 'ev-slate', 'ev-plum', 'ev-teal'][Math.floor(Math.random() * 6)],
      attendees: getAttendees(user?.name),
    });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="bg-elevated/40 rounded-2xl border border-border-subtle overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
      {/* Header Row */}
      <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-border-subtle">
        <div className="bg-surface/50" />
        {weekDays.map((day, index) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={index}
              className={`py-4 px-2 text-center border-l border-border-subtle ${
                isToday ? 'bg-accent-muted/30' : 'bg-surface/30'
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.12em] text-text-muted font-medium mb-1.5">
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg font-display font-semibold ${
                isToday ? 'text-accent' : 'text-text-primary'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-[72px_repeat(7,1fr)] relative">
        {/* Time Labels */}
        <div className="bg-surface/30">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-[72px] flex items-start justify-end pr-3 pt-1.5 text-[10px] text-text-muted font-medium border-b border-border-subtle tracking-wide"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((day, dayIndex) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay?.[dateKey] || [];
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div key={dayIndex} className={`relative border-l border-border-subtle ${
              isToday ? 'bg-accent-muted/10' : ''
            }`}>
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[72px] border-b border-border-subtle hover:bg-elevated/30 transition-colors duration-150"
                />
              ))}

              {/* Event Cards from real data */}
              {dayEvents.map((event) => {
                const topPosition = (event.hour - 8) * 72;
                const height = event.duration * 72 - 6;
                const colors = colorMap[event.color];
                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 z-20 cursor-pointer"
                    style={{ top: `${topPosition + 3}px`, height: `${height}px` }}
                  >
                    <EventCard event={{ ...event, colors }} />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Current Time Line - only show if today is in view */}
        {weekDays.some(day => format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) && (
          <div className="absolute left-0 right-0 z-40 pointer-events-none" style={{ top: `${(new Date().getHours() - 8) * 72}px` }}>
            <div className="absolute left-[60px] -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-now-line z-50 animate-pulse-soft" style={{ boxShadow: '0 0 8px 2px rgba(212,119,92,0.4)' }} />
            <div className="absolute left-[60px] right-0 h-px bg-now-line/60" />
          </div>
        )}
      </div>
    </div>
  );
}