"use client"
import React, { useState } from 'react';

import { googleApi } from "@/lib/provider-api-client";

export default function CreateCalendarEvent({ onCreate }: { onCreate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [summary, setSummary] = useState('');
  const [timeZone, setTimeZone] = useState('Europe/London');

  const getTodayForInput = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [startDateTime, setStartDateTime] = useState(getTodayForInput());
  const [endDateTime, setEndDateTime] = useState(getTodayForInput());



  const handleCreateEvent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await googleApi.calendar.createEvent({
        calendarId: 'primary',
        summary,
        start: {
          dateTime: new Date(startDateTime),
          timeZone,
        },
        end: {
          dateTime: new Date(endDateTime),
          timeZone,
        },
      });
      console.log(response.success);
      setSuccess('Event created successfully!');
      onCreate();
    } catch (err) {
      setError('Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <label>Summary:</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <div>
        <label>Start Date & Time:</label>
        <input
          type="datetime-local"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
        />
      </div>
      <div>
        <label>End Date & Time:</label>
        <input
          type="datetime-local"
          value={endDateTime}
          onChange={(e) => setEndDateTime(e.target.value)}
        />
      </div>
      <div>
        <label>Time Zone:</label>
        <input
          type="text"
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
        />
      </div>
      <button onClick={handleCreateEvent} disabled={loading}>
        {loading ? 'Creating...' : 'Create Calendar Event'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}