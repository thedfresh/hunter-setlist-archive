'use client';
import { useState, useEffect } from 'react';

interface Event {
  id: number;
  year: number;
  month: number;
  day: number;
  displayDate: string;
  slug: string;
  verified: boolean;
  showTiming: string | null;
  venue: {
    name: string;
    city: string;
    stateProvince: string;
  };
  primaryBand: {
    name: string;
  };
  sets: Array<{
    id: number;
    setType: { displayName: string };
    performances: Array<{
      id: number;
      song: { title: string };
      seguesInto: boolean;
      performanceOrder: number;
    }>;
  }>;
}

export default function TodayInHunterHistory() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    fetch(`/api/events/on-date?month=${month}&day=${day}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading Today in Hunter History...</div>;
  if (!events.length) return <div>No Hunter events on this date.</div>;

  return (
    <div className="today-in-hunter-history">
      <h2>Today in Hunter History</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.displayDate}</strong> — {event.primaryBand?.name || 'Solo'} at {event.venue?.name}, {event.venue?.city}, {event.venue?.stateProvince}
            {/* Optionally list sets/songs here */}
          </li>
        ))}
      </ul>
    </div>
  );
}
