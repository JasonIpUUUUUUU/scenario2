import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekView } from './WeekView';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { CreateEventModal} from './CreateEventModal';


const viewModes = ['Day', 'Week', 'Month'];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const handlePrevious = () => {
    if (currentView === 'Month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'Week') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (currentView === 'Month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'Week') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDisplayDate = () => {
    if (currentView === 'Month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (currentView === 'Week') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      return format(currentDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 pt-7 pb-5 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-5">
          <h1 className="font-display text-[28px] font-semibold text-text-primary tracking-tight leading-none">
            {getDisplayDate()}
          </h1>
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevious}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button 
              onClick={handleToday}
              className="px-3 h-8 text-xs font-medium rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-all duration-200"
            >
              Today
            </button>
            <button 
              onClick={handleNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-0.5 bg-elevated/60 p-1 rounded-xl border border-border-subtle">
          {viewModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setCurrentView(mode as 'Day' | 'Week' | 'Month')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                currentView === mode
                  ? 'bg-card text-text-primary border border-border-medium'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-8 pb-6 scrollbar-hide">
        {currentView === 'Week' && <WeekView currentDate={currentDate}
                                              onTimeSlotClick = {(date: Date) => {
                                                setSelectedEvent(null);
                                                setSelectedDate(date);
                                                setIsModalOpen(true);
                                              }}
                                              setSelectedEvent={setSelectedEvent} 
                                              onEventClick={(event: any) => {
                                                setSelectedEvent(event);
                                                setSelectedDate(null);
                                                setIsModalOpen(true);
                                              }}/>}
        {currentView === 'Month' && (
          <div className="text-center text-text-secondary py-20">
            Month view coming soon...
          </div>
        )}
        {currentView === 'Day' && (
          <div className="text-center text-text-secondary py-20">
            Day view coming soon...
          </div>
        )}
      </div>
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        initialDate={selectedDate}
        event={selectedEvent}
        />
    </div>
  );
}