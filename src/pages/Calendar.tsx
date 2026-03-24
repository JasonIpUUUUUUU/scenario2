/* import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Button,
  Dialog,
  Field,
  Input,
  Textarea,
  VStack,
  HStack,
  Spinner,
  Portal,
} from '@chakra-ui/react';
import { toaster } from '../components/ui/toaster';
import { groupsApi } from '../api/client';
import { eventsApi } from '../api/client';
import { groupEventsApi } from '../api/client';
import type { Event } from '../types/api';
import type { GroupEvent } from '../types/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface EventFormData {
  title: string;
  description: string;
  location: string;
}

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | GroupEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState<'personal' | 'group'>('personal');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewMode, setViewMode] =useState<'view' | 'edit'>('view');
  const queryClient = useQueryClient();
  const { data: groupsData } = useQuery({
  queryKey: ['groups'],
  queryFn: () => groupsApi.list(),
  });
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // Fetch events
  const { data: personalData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  const { data: groupData } = useQuery({
    queryKey: ['groupEvents', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return { events: [] };
      return groupEventsApi.list(selectedGroupId);
    },
  });

  // Create individual event mutation
  const createMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toaster.success({
        title: 'Event created',
        description: 'Your event has been added to the calendar',
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Failed to create event',
        description: error.response?.data?.error?.message || 'An error occurred',
      });
    },
  });

  // Create group event mutation
  const groupCreateMutation = useMutation({
  mutationFn: ({ groupId, data }: { groupId: string; data: any }) =>
    groupEventsApi.create(groupId, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    toaster.success({
      title: 'Group event created',
    });
    setIsOpen(false);
    resetForm();
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Failed to create event',
        description: error.response?.data?.error?.message || 'An error occurred',
      });
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toaster.success({
        title: 'Event updated',
        description: 'Your changes have been saved',
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Failed to update event',
        description: error.response?.data?.error?.message || 'An error occurred',
      });
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toaster.success({
        title: 'Event deleted',
        description: 'The event has been removed',
      });
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Failed to delete event',
        description: error.response?.data?.error?.message || 'An error occurred',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
    });
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setFormData({
      title: '',
      description: '',
      location: '',
    });
    setViewMode('edit');
    setIsOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event =
      personalData?.events.find((e) => e.id === clickInfo.event.id) ||
      groupData?.events.find((e) => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        location: event.location || '',
      });
      setViewMode('view');
      setIsOpen(true);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const event =
      personalData?.events.find((e) => e.id === dropInfo.event.id) ||
      groupData?.events.find((e) => e.id === dropInfo.event.id);
    if (event) {
      updateMutation.mutate({
        id: event.id,
        data: {
          start_ts: dropInfo.event.start.toISOString(),
          end_ts: dropInfo.event.end?.toISOString() || dropInfo.event.start.toISOString(),
        },
      });
    }
  };

  const handleEventResize = (resizeInfo: any) => {
      const event =
        personalData?.events.find((e) => e.id === resizeInfo.event.id) ||
        groupData?.events.find((e) => e.id === resizeInfo.event.id);
    if (event) {
      updateMutation.mutate({
        id: event.id,
        data: {
          end_ts: resizeInfo.event.end?.toISOString() || resizeInfo.event.start.toISOString(),
        },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) return;

  if (eventType === 'personal') {
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      start_ts: selectedSlot.start.toISOString(),
      end_ts: selectedSlot.end.toISOString(),
    });
  } else if (eventType === 'group' && selectedGroupId) {
    groupCreateMutation.mutate({
      groupId: selectedGroupId,
      data: {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_ts: selectedSlot.start.toISOString(),
        end_ts: selectedSlot.end.toISOString(),
      },
    });
  } else if (eventType == 'group' && !selectedGroupId) {
    toaster.error({
      title: 'Please select a group',
    });
    return;
  }
  };

  const handleDelete = () => {
    if (selectedEvent && window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(selectedEvent.id);
      setIsOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="500px">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  return (
    <Box h="calc(100vh - 100px)" bg="white" p={4} borderRadius="lg" boxShadow="sm">
      <Box display="flex" justifyContent="space-between" mb={4}>

        <Button onClick={() => navigate('/groups')}>
          Manage Groups
        </Button>

          <Button
            colorScheme="red"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>

      </Box>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={[
          ...(personalData?.events || []).map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start_ts,
            end: event.end_ts,
            backgroundColor: '#1a73e8',
          })),
          ...(groupData?.events || []).map((event) => ({
            id: event.id,
            title: `[Group] ${event.title}`,
            start: event.start_ts,
            end: event.end_ts,
            backgroundColor: '#e91e63',
          })),
        ]}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        height="100%"
      />

      <Dialog.Root open={isOpen} onOpenChange={(details: any) => setIsOpen(details.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                {viewMode === 'view' ? (
                  <VStack gap={4} align="start">
                    <Box>
                      <strong>Title:</strong> {selectedEvent?.title}
                    </Box>
                    <Box>
                      <strong>Description:</strong> {selectedEvent?.description || 'None'}
                    </Box>
                    <Box>
                      <strong>Location:</strong> {selectedEvent?.location || 'None'}
                    </Box>

                    <HStack width="full" pt={4}>
                      <Button
                        colorScheme="blue"
                        onClick={() => setViewMode('edit')}
                        flex={1}
                      >
                        Edit
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={handleDelete}
                        flex={1}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <VStack gap={4}>
                      <Field.Root>
                        <Field.Label>Event Type</Field.Label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value as any)}
                        >
                          <option value="personal">Personal</option>
                          <option value="group">Group</option>
                        </select>
                      </Field.Root>

                      {eventType === 'group' && (
                        <Field.Root>
                          <Field.Label>Group ID</Field.Label>
                            <select
                              value={selectedGroupId || ''}
                              onChange={(e) => setSelectedGroupId(e.target.value)}
                            >
                              <option value="">Select a group</option>
                              {groupsData?.groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                        </Field.Root>
                      )}

                      <Field.Root required>
                        <Field.Label>Title</Field.Label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Team Meeting"
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Description</Field.Label>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Event details..."
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Location</Field.Label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Conference Room A"
                        />
                      </Field.Root>

                      <HStack gap={4} pt={4} width="full">
                        <Button
                          type="submit"
                          colorScheme="brand"
                          loading={createMutation.isPending || updateMutation.isPending}
                          flex={1}
                        >
                          {selectedEvent ? 'Update' : 'Create'}
                        </Button>

                        {selectedEvent && (
                          <Button
                            colorScheme="red"
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                            flex={1}
                          >
                            Delete
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </form>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}; */