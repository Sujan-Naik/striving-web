"use client"

import { useState, useEffect } from "react"
import { googleApi } from "@/lib/provider-api-client"
import { type EventProps, VariantEnum } from "headed-ui"

export function useCalendar() {
  const [events, setEvents] = useState<EventProps[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await googleApi.calendar.getEvents()

      if (!result.success) {
        setError(result.error)
        return
      }

      // Map Google Calendar events to HeadedCalendar EventProps format
      const fetchedEvents: EventProps[] = (result.data.items || []).map((item: any) => ({
        variant: VariantEnum.Primary,
        name: item.summary || "(No Title)",
        description: item.description || "",
        date: new Date(item.start.dateTime || item.start.date),
        endDate: new Date(item.end.dateTime || item.end.date),
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
