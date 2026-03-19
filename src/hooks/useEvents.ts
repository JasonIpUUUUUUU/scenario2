import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

// Mock function to simulate API call
const fetchEvents = async () => {
  return {
    events: [
      {
        id: '1',
        title: 'Team Meeting',
        start_ts: new Date().toISOString(),
        end_ts: new Date(Date.now() + 3600000).toISOString(),
      },
      {
        id: '2',
        title: 'Lunch with Jane',
        start_ts: new Date(Date.now() + 86400000).toISOString(),
        end_ts: new Date(Date.now() + 90000000).toISOString(),
      },
    ],
  };
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newEvent: any) => {
      return Promise.resolve({ data: newEvent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};