import React from 'react';
import { useEvents, useCreateEvent } from '../hooks/useEvents';

const EventsList = () => {
  const { data, isLoading, error } = useEvents();
  const createEvent = useCreateEvent();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading events</div>;

  return (
    <div>
      <h2>My Events</h2>
      <button
        onClick={() => {
          createEvent.mutate({
            title: 'New Event',
            start_ts: new Date().toISOString(),
            end_ts: new Date(Date.now() + 3600000).toISOString(),
          });
        }}
      >
        Add Test Event
      </button>
      
      <ul>
        {data?.events.map((event: any) => (
          <li key={event.id}>
            <strong>{event.title}</strong>
            <br />
            {new Date(event.start_ts).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;