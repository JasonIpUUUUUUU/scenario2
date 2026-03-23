import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/client';
import { EventCard } from './EventCard';
import { format, parseISO, startOfWeek, addDays, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import { toaster } from './ui/toaster';

// Color mapping for different event types
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  'ev-terracotta': { 
    bg: 'bg-ev-terracotta-bg', 
    text: 'text-ev-terracotta', 
    border: 'border-ev-terracotta' 
  },
  'ev-sage': { 
    bg: 'bg-ev-sage-bg', 
    text: 'text-ev-sage', 
    border: 'border-ev-sage' 
  },
  'ev-gold': { 
    bg: 'bg-ev-gold-bg', 
    text: 'text-ev-gold', 
    border: 'border-ev-gold' 
  },
  'ev-slate': { 
    bg: 'bg-ev-slate-bg', 
    text: 'text-ev-slate', 
    border: 'border-ev-slate' 
  },
  'ev-plum': { 
    bg: 'bg-ev-plum-bg', 
    text: 'text-ev-plum', 
    border: 'border-ev-plum' 
  },
  'ev-teal': { 
    bg: 'bg-ev-teal-bg', 
    text: 'text-ev-teal', 
    border: 'border-ev-teal' 
  },
};

// Predefined color palette for events
const eventColors = [
  'ev-terracotta',
  'ev-sage', 
  'ev-gold',
  'ev-slate',
  'ev-plum',
  'ev-teal',
];

// Generate consistent color for an event based on its ID
const getEventColor = (eventId: string) => {
  const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return eventColors[hash % eventColors.length];
};

// Time slots from 8 AM to 9 PM (14 hours)
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8);

// Get attendees for an event (in real app, this would come from the backend)
const getAttendees = (userName?: string, eventTitle?: string) => {
  // Mock attendees - in production, this would come from the event participants API
  const mockAttendees = [
    { name: userName || 'You', initials: userName?.charAt(0) || 'U', color: '#d4775c' },
    { name: 'Sarah Chen', initials: 'SC', color: '#b87ba8' },
    { name: 'Mike Ross', initials: 'MR', color: '#6bbab4' },
  ];
  
  // Add random attendees based on event title to make it look dynamic
  if (eventTitle?.toLowerCase().includes('meeting')) {
    mockAttendees.push({ name: 'Alex Wong', initials: 'AW', color: '#7a9ec4' });
  }
  if (eventTitle?.toLowerCase().includes('dinner') || eventTitle?.toLowerCase().includes('lunch')) {
    mockAttendees.push({ name: 'Emma Wilson', initials: 'EW', color: '#d4a843' });
  }
  
  return mockAttendees.slice(0, 4); // Limit to 4 attendees
};

interface WeekViewProps {
  currentDate?: Date;
  onEventClick?: (event: any) => void;
}

export function WeekView({ currentDate = new Date(), onEventClick }: WeekViewProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: Date; hour: number } | null>(null);

  // Get the start of the week (Monday)
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Create array of days for the week
  const weekDays = eachDayOfInterval({
    start: startOfWeekDate,
    end: addDays(startOfWeekDate, 6),
  });

  // Fetch events
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Update current time every minute for the time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toaster.success({
        title: 'Event deleted',
        description: 'The event has been removed from your calendar',
      });
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Failed to delete event',
        description: error.response?.data?.error?.message || 'Please try again',
      });
    },
  });

  // Group events by day
  const eventsByDay = data?.events.reduce((acc, event) => {
    const eventDate = parseISO(event.start_ts);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) acc[dateKey] = [];
    
    const startHour = eventDate.getHours();
    const startMinute = eventDate.getMinutes();
    const endDate = parseISO(event.end_ts);
    const duration = (endDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60); // Duration in hours
    
    acc[dateKey].push({
      ...event,
      hour: startHour + startMinute / 60, // Decimal hour for precise positioning
      duration: duration,
      color: getEventColor(event.id),
      attendees: getAttendees(user?.name, event.title),
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Handle event click
  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    } else {
      // Default action - show event details in console
      console.log('Event clicked:', event);
      toaster.info({
        title: event.title,
        description: `${format(parseISO(event.start_ts), 'h:mm a')} - ${format(parseISO(event.end_ts), 'h:mm a')}`,
      });
    }
  };

  // Handle event delete
  const handleDeleteEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  // Handle drag start for creating new event
  const handleDragStart = (day: Date, hour: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ day, hour });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Handle time slot click for creating new event
  const handleTimeSlotClick = (day: Date, hour: number) => {
    // In a real app, you would open the create event modal with pre-filled date/time
    console.log('Create event at:', format(day, 'MMM d, yyyy'), hour);
    toaster.info({
      title: 'Create Event',
      description: `Click "Create Event" button to add an event on ${format(day, 'MMM d')} at ${hour}:00`,
    });
  };

  // Calculate position for event card
  const getEventPosition = (hour: number, duration: number) => {
    const startHour = hour;
    const topPosition = (startHour - 8) * 72; // 72px per hour
    const height = duration * 72 - 4; // Subtract a few pixels for spacing
    return { top: `${topPosition + 2}px`, height: `${height}px` };
  };

  // Check if event is currently happening
  const isEventCurrent = (event: any) => {
    const now = new Date();
    const eventStart = parseISO(event.start_ts);
    const eventEnd = parseISO(event.end_ts);
    return now >= eventStart && now <= eventEnd;
  };

  // Check if a day is today
  const isDayToday = (day: Date) => {
    return isToday(day);
  };

  // Refresh events when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">⚠️</div>
          <p className="text-text-secondary mb-2">Failed to load events</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg text-accent transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalEvents = data?.events?.length || 0;

  return (
    <div className="bg-elevated/40 rounded-2xl border border-border-subtle overflow-hidden animate-fade-in">
      {/* Header Row with Day Names */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border-subtle bg-surface/30">
        <div className="p-4 text-center text-text-muted text-xs font-medium">GMT+0</div>
        {weekDays.map((day, index) => {
          const dayEvents = eventsByDay?.[format(day, 'yyyy-MM-dd')] || [];
          const isToday = isDayToday(day);
          
          return (
            <div
              key={index}
              className={`py-4 px-2 text-center border-l border-border-subtle transition-all ${
                isToday 
                  ? 'bg-accent-muted/30 relative' 
                  : 'bg-surface/30'
              }`}
            >
              <div className="text-[11px] uppercase tracking-[0.12em] text-text-muted font-medium mb-2">
                {format(day, 'EEE')}
              </div>
              <div className={`text-xl font-display font-semibold ${
                isToday ? 'text-accent' : 'text-text-primary'
              }`}>
                {format(day, 'd')}
              </div>
              {dayEvents.length > 0 && (
                <div className="mt-2 text-[10px] text-text-muted">
                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="relative overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-hide">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] relative min-w-[800px]">
          {/* Time Labels Column */}
          <div className="bg-surface/20 sticky left-0 z-10">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-[72px] flex items-start justify-end pr-3 pt-2 text-[11px] text-text-muted font-medium border-b border-border-subtle"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay?.[dateKey] || [];
            const isToday = isDayToday(day);
            
            return (
              <div 
                key={dayIndex} 
                className={`relative border-l border-border-subtle ${
                  isToday ? 'bg-accent-muted/5' : ''
                }`}
              >
                {/* Time Slots Grid */}
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => handleTimeSlotClick(day, hour)}
                    onMouseDown={(e) => handleDragStart(day, hour, e)}
                    onMouseUp={handleDragEnd}
                    className={`h-[72px] border-b border-border-subtle hover:bg-elevated/30 transition-colors duration-150 cursor-pointer group ${
                      isDragging && dragStart?.day === day && Math.abs(dragStart.hour - hour) < 2 
                        ? 'bg-accent/10' 
                        : ''
                    }`}
                  >
                    {/* Hover indicator for creating event */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-accent text-xs">+</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Event Cards */}
                {dayEvents.map((event) => {
                  const { top, height } = getEventPosition(event.hour, event.duration);
                  const colors = colorMap[event.color];
                  const isCurrent = isEventCurrent(event);
                  
                  return (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 z-20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-30 ${
                        isCurrent ? 'ring-2 ring-accent/50' : ''
                      }`}
                      style={{ top, height }}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <EventCard 
                        event={{ 
                          ...event, 
                          colors,
                          isCurrent 
                        }} 
                        onDelete={(e) => handleDeleteEvent(event.id, e)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Current Time Line - only show if today is in view */}
          {weekDays.some(day => isDayToday(day)) && (
            <div 
              className="absolute left-0 right-0 z-40 pointer-events-none"
              style={{ top: `${(currentTime.getHours() - 8 + currentTime.getMinutes() / 60) * 72}px` }}
            >
              <div className="absolute left-[60px] -translate-y-1/2 w-3 h-3 rounded-full bg-now-line z-50 animate-pulse-soft ring-2 ring-accent/20" />
              <div className="absolute left-[60px] right-0 h-[2px] bg-now-line/80 shadow-lg shadow-accent/20" />
            </div>
          )}
        </div>
      </div>

      {/* Footer with summary */}
      <div className="px-4 py-3 border-t border-border-subtle bg-surface/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted">
            {totalEvents} event{totalEvents !== 1 ? 's' : ''} this week
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent/60"></div>
            <span className="text-[10px] text-text-muted">Current time</span>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}