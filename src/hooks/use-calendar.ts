"use client"

import { useState, useEffect } from "react"
import { VariantEnum } from "headed-ui"
import { EventProps } from "@/components/calendar/event-props"

export function useCalendar(calendarId: string) {
  const [events, setEvents] = useState<EventProps[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/google/calendar/events?calendarId=${calendarId}`)

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch events")
        return
      }

      const data = await response.json()
      console.log(data.items)

      const fetchedEvents: EventProps[] = (data.items || []).map((item: any) => ({
        variant: VariantEnum.Primary,
        name: item.summary || "(No Title)",
        description: item.description || "",
        date: new Date(item.start.dateTime || item.start.date),
        endDate: new Date(item.end.dateTime || item.end.date),
        eventId: item.id
      }))

      setEvents(fetchedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return { events, loading, error, refetch: fetchEvents }
}