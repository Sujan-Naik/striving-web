"use client"

import { useState, useEffect } from "react"

interface Calendar {
  id: string
  summary: string
}

export function CalendarSelector({ onCalendarSelect }: { onCalendarSelect: (calendarId: string) => void }) {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [selectedCalendar, setSelectedCalendar] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendars = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/google/calendar/calendars')
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch calendars")
        return
      }

      const data = await response.json()
        console.log(data)
      setCalendars(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCalendarChange = (calendarId: string) => {
    setSelectedCalendar(calendarId)
    onCalendarSelect(calendarId)
  }

  useEffect(() => {
    fetchCalendars()
  }, [])

  if (loading) return <div>Loading calendars...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <select
      value={selectedCalendar}
      onChange={(e) => handleCalendarChange(e.target.value)}
    >
      <option value="">Select a calendar</option>
      {calendars.map((calendar) => (
        <option key={calendar.id} value={calendar.id}>
          {calendar.summary}
        </option>
      ))}
    </select>
  )
}