import { useState, useEffect, useRef } from 'react';
import { X, MapPin, AlignLeft, Repeat, Sparkles, Calendar, Clock, Users, Edit2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/client';
import { toaster } from './ui/toaster';
import { format, addHours, setHours, setMinutes } from 'date-fns';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  startTime: string;
  duration: number; // in minutes
  customDuration: boolean;
  customDurationValue: string;
  attendees: string[];
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: new Date(),
    startTime: '09:00',
    duration: 60,
    customDuration: false,
    customDurationValue: '60',
    attendees: [],
  });
  
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'smart' | 'manual'>('smart');
  const [smartInput, setSmartInput] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toaster.success({
        title: 'Event created!',
        description: 'Your event has been added to the calendar',
      });
      resetForm();
      handleClose();
      if (onEventCreated) onEventCreated();
    },
    onError: (error: any) => {
      console.error('Failed to create event:', error);
      toaster.error({
        title: 'Failed to create event',
        description: error.response?.data?.error?.message || 'Please try again',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      startTime: '09:00',
      duration: 60,
      customDuration: false,
      customDurationValue: '60',
      attendees: [],
    });
    setSmartInput('');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      resetForm();
      onClose();
    }, 250);
  };

  // Parse smart input with duration detection
  const parseSmartInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    const newFormData = { ...formData };
    
    // Parse title (first part before any keywords)
    const titleMatch = input.match(/^([^@#!]+?)(?=\s+(?:tomorrow|next|at|on|with|@|#|!|for|$))/i);
    if (titleMatch) {
      newFormData.title = titleMatch[1].trim();
    }
    
    // Parse date
    let startDate = new Date();
    if (lowerInput.includes('tomorrow')) {
      startDate.setDate(startDate.getDate() + 1);
    } else if (lowerInput.includes('next friday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilFriday + 7);
    } else if (lowerInput.includes('next monday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilMonday = (1 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilMonday + 7);
    } else if (lowerInput.includes('monday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilMonday = (1 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilMonday);
    } else if (lowerInput.includes('tuesday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilTuesday);
    } else if (lowerInput.includes('wednesday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilWednesday);
    } else if (lowerInput.includes('thursday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilThursday);
    } else if (lowerInput.includes('friday')) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      startDate.setDate(today.getDate() + daysUntilFriday);
    }
    
    // Parse time
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3].toLowerCase();
      
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      startDate = setHours(startDate, hour);
      startDate = setMinutes(startDate, minute);
      newFormData.startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    
    // Parse duration - look for "for X hours", "for X minutes", "X hr", etc.
    const durationHourMatch = input.match(/for\s+(\d+)\s+hour[s]?/i);
    const durationHourMatch2 = input.match(/(\d+)\s+hour[s]?\s+long/i);
    const durationMinuteMatch = input.match(/for\s+(\d+)\s+minute[s]?/i);
    const durationMinuteMatch2 = input.match(/(\d+)\s+minute[s]?\s+long/i);
    
    if (durationHourMatch) {
      const hours = parseInt(durationHourMatch[1]);
      newFormData.duration = hours * 60;
      newFormData.customDuration = false;
    } else if (durationHourMatch2) {
      const hours = parseInt(durationHourMatch2[1]);
      newFormData.duration = hours * 60;
      newFormData.customDuration = false;
    } else if (durationMinuteMatch) {
      const minutes = parseInt(durationMinuteMatch[1]);
      newFormData.duration = minutes;
      newFormData.customDuration = false;
    } else if (durationMinuteMatch2) {
      const minutes = parseInt(durationMinuteMatch2[1]);
      newFormData.duration = minutes;
      newFormData.customDuration = false;
    }
    
    newFormData.startDate = startDate;
    setFormData(newFormData);
  };

  const handleSmartInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSmartInput(value);
    if (value.length > 10) {
      parseSmartInput(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toaster.error({
        title: 'Title required',
        description: 'Please enter an event title',
      });
      return;
    }
    
    // Get duration value (handle custom duration)
    let durationMinutes = formData.duration;
    if (formData.customDuration) {
      const customValue = parseInt(formData.customDurationValue);
      if (isNaN(customValue) || customValue <= 0) {
        toaster.error({
          title: 'Invalid duration',
          description: 'Please enter a valid duration (minimum 5 minutes)',
        });
        return;
      }
      durationMinutes = customValue;
      if (durationMinutes < 5) {
        toaster.error({
          title: 'Duration too short',
          description: 'Event duration must be at least 5 minutes',
        });
        return;
      }
    }
    
    // Combine date and time
    const startDateTime = new Date(formData.startDate);
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes);
    
    const endDateTime = addHours(startDateTime, durationMinutes / 60);
    
    createEventMutation.mutate({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      start_ts: startDateTime.toISOString(),
      end_ts: endDateTime.toISOString(),
    });
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  // Duration options in minutes
  const durationOptions = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
  ];

  // Quick date options
  const quickDates = [
    { label: 'Today', getDate: () => new Date() },
    { label: 'Tomorrow', getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    }},
    { label: 'This Weekend', getDate: () => {
      const date = new Date();
      const dayOfWeek = date.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      date.setDate(date.getDate() + daysUntilSaturday);
      return date;
    }},
    { label: 'Next Week', getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }},
  ];

  // Format duration display
  const formatDurationDisplay = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = minutes / 60;
    if (hours === 1) return '1 hour';
    if (hours === 1.5) return '1.5 hours';
    if (Number.isInteger(hours)) return `${hours} hours`;
    return `${hours.toFixed(1)} hours`;
  };

  // Handle custom duration change
  const handleCustomDurationChange = (value: string) => {
    setFormData({ ...formData, customDurationValue: value });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div
        ref={modalRef}
        className={`relative w-[680px] rounded-[32px] border border-white/10 overflow-hidden ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
        style={{
          backgroundColor: 'rgba(26, 25, 23, 0.98)',
          boxShadow: '0 0 0 1px rgba(255,245,230,0.04), 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 120px -20px rgba(212,119,92,0.08)',
        }}
      >
        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-semibold text-text-primary">Create Event</h2>
              <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('smart')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    activeTab === 'smart' 
                      ? 'bg-accent text-white' 
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Smart
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    activeTab === 'manual' 
                      ? 'bg-accent text-white' 
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all duration-200"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <form onSubmit={handleSubmit}>
            {/* Smart Input Mode */}
            {activeTab === 'smart' && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm text-text-secondary">Describe your event naturally</span>
                </div>
                <textarea
                  value={smartInput}
                  onChange={handleSmartInputChange}
                  placeholder="Dinner with friends this Friday at 7pm for 2 hours..."
                  rows={2}
                  className="w-full bg-white/[0.04] rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted font-body resize-none outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                />
                {formData.title && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{format(formData.startDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{formData.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
                      <span>⏱️</span>
                      <span>{formatDurationDisplay(formData.duration)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Input Mode */}
            {activeTab === 'manual' && (
              <div className="space-y-4 mb-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Team Meeting"
                    className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="date"
                        value={format(formData.startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                        className="w-full bg-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-text-primary outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-text-primary outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Date Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {quickDates.map((quick) => (
                    <button
                      key={quick.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, startDate: quick.getDate() })}
                      className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary hover:text-text-primary transition-all"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>

                {/* Duration with Custom Input */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Duration</label>
                  
                  {/* Toggle between preset and custom */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customDuration: false })}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${
                        !formData.customDuration
                          ? 'bg-accent text-white'
                          : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'
                      }`}
                    >
                      Preset Durations
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customDuration: true })}
                      className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${
                        formData.customDuration
                          ? 'bg-accent text-white'
                          : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      Custom Duration
                    </button>
                  </div>
                  
                  {/* Preset Duration Buttons */}
                  {!formData.customDuration && (
                    <div className="flex gap-2 flex-wrap">
                      {durationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration: opt.value })}
                          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                            formData.duration === opt.value
                              ? 'bg-accent text-white'
                              : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Custom Duration Input */}
                  {formData.customDuration && (
                    <div className="space-y-2">
                      <div className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            value={formData.customDurationValue}
                            onChange={(e) => handleCustomDurationChange(e.target.value)}
                            placeholder="Enter duration"
                            min="5"
                            step="5"
                            className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue = parseInt(formData.customDurationValue) || 0;
                              handleCustomDurationChange(String(currentValue + 15));
                            }}
                            className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                          >
                            +15
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue = parseInt(formData.customDurationValue) || 0;
                              if (currentValue >= 15) {
                                handleCustomDurationChange(String(currentValue - 15));
                              }
                            }}
                            className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                          >
                            -15
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCustomDurationChange('30')}
                          className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                        >
                          30 min
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomDurationChange('60')}
                          className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                        >
                          1 hour
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomDurationChange('90')}
                          className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                        >
                          1.5 hours
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomDurationChange('120')}
                          className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                        >
                          2 hours
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomDurationChange('180')}
                          className="px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary transition-all"
                        >
                          3 hours
                        </button>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">
                        Enter any duration in minutes (minimum 5 minutes)
                      </p>
                    </div>
                  )}
                  
                  {/* Duration Preview */}
                  <div className="mt-2 text-right">
                    <span className="text-xs text-text-muted">
                      Event will last: {' '}
                      <span className="text-accent font-medium">
                        {formData.customDuration 
                          ? (() => {
                              const mins = parseInt(formData.customDurationValue);
                              if (isNaN(mins)) return 'Invalid';
                              return formatDurationDisplay(mins);
                            })()
                          : formatDurationDisplay(formData.duration)
                        }
                      </span>
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Location (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Conference Room A or Zoom link"
                      className="w-full bg-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about your event..."
                    rows={2}
                    className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted resize-none outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createEventMutation.isPending || !formData.title.trim()}
                className="px-8 py-2.5 rounded-xl font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #d4775c 0%, #e08a6f 50%, #d4a843 100%)',
                  boxShadow: '0 4px 20px -4px rgba(212,119,92,0.4)',
                }}
              >
                {createEventMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Event Preview (when smart input has data) */}
        {activeTab === 'smart' && formData.title && (
          <div className="border-t border-white/[0.08] p-4 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Event Preview</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">{formData.title}</h3>
                <p className="text-xs text-text-secondary">
                  {format(formData.startDate, 'EEEE, MMMM d')} at {formData.startTime}
                  {' • '}
                  {formatDurationDisplay(formData.duration)}
                </p>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-ev-slate-bg flex items-center justify-center text-xs border-2 border-surface">
                  <Users className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}