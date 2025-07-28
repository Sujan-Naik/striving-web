"use client"

import { EventProps } from "@/components/calendar/event-props";
import { handleCreateEvent } from "@/lib/handle-create-event";

import React, { useState, useEffect } from 'react';

export default function CreateCalendarEvent({
  onCreate,
  defaultDate,
}: { onCreate: () => void; defaultDate?: Date }) {
  const initialDate = defaultDate || new Date();

  const [formData, setFormData] = useState<EventProps>({
    name: '',
    description: '',
    date: initialDate,
    endDate: new Date(initialDate.getTime() + 3600 * 1000), // +1 hour
    eventId: '',
  });

  const getInputValue = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // If defaultDate prop changes, update the formData accordingly
  useEffect(() => {
    if (defaultDate) {
      setFormData((prev) => ({
        ...prev,
        date: defaultDate,
        endDate: new Date(defaultDate.getTime() + 3600 * 1000),
      }));
    }
  }, [defaultDate]);

  const handleCreate = async () => {
    // ... your create logic
    await handleCreateEvent(formData);
    onCreate();
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <input
        type="datetime-local"
        value={getInputValue(formData.date)}
        onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
      />
      <input
        type="datetime-local"
        value={getInputValue(formData.endDate!)}
        onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
      />
      <button onClick={handleCreate} disabled={false /* your loading check */}>
        Create Event
      </button>
    </div>
  );
}