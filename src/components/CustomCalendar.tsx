import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface CustomCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  highlightedDates?: Date[];
}

export function CustomCalendar({ 
  selectedDate = new Date(), 
  onDateSelect, 
  minDate, 
  maxDate,
  highlightedDates = [] 
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Get days for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateHighlighted = (date: Date) => {
    return highlightedDates.some(d => isSameDay(d, date));
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] border border-border-subtle rounded-xl hover:border-accent/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
        <ChevronLeft className="w-4 h-4 text-text-muted rotate-[-90deg]" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-[320px] z-50 animate-fade-in">
            <div className="bg-surface rounded-2xl border border-border-medium shadow-2xl overflow-hidden">
              {/* Calendar Header */}
              <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-elevated/30">
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-text-secondary" />
                </button>
                <span className="font-display text-lg font-semibold text-text-primary">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 px-3 pt-3">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[11px] font-medium text-text-muted py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const isDisabled = isDateDisabled(day);
                  const isHighlighted = isDateHighlighted(day);
                  const isHovered = hoveredDate && isSameDay(day, hoveredDate);

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && handleDateClick(day)}
                      onMouseEnter={() => setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      disabled={isDisabled}
                      className={`
                        relative w-full aspect-square rounded-xl flex items-center justify-center text-sm transition-all duration-200
                        ${!isCurrentMonth && !isSelected ? 'opacity-40' : 'opacity-100'}
                        ${isSelected ? 'bg-accent text-white shadow-lg scale-105' : ''}
                        ${isTodayDate && !isSelected ? 'border-2 border-accent/50 text-accent' : ''}
                        ${isHighlighted && !isSelected ? 'bg-accent/20 text-accent' : ''}
                        ${isHovered && !isSelected && !isDisabled ? 'bg-white/[0.08] scale-105' : ''}
                        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.08]'}
                      `}
                    >
                      {format(day, 'd')}
                      
                      {/* Highlight Dot */}
                      {isHighlighted && !isSelected && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                      )}
                      
                      {/* Selected Pulse Effect */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl animate-pulse-soft bg-accent/30" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border-subtle bg-elevated/20">
                <button
                  onClick={() => {
                    onDateSelect(new Date());
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-xs text-text-secondary hover:text-accent transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}