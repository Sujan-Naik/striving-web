"use client"

import { useState } from "react"

interface CreateCalendarData {
  summary: string
  description?: string
}

export function CalendarCreator({ onCalendarCreated }: { onCalendarCreated?: (calendar: any) => void }) {
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const createCalendar = async () => {
    if (!summary.trim()) {
      setError("Calendar name is required")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/google/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summary.trim(),
          description: description.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create calendar")
        return
      }

      const data = await response.json()
      setSuccess(`Calendar "${data.summary}" created successfully`)
      setSummary("")
      setDescription("")
      onCalendarCreated?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Calendar name"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />
      <button onClick={createCalendar} disabled={loading || !summary.trim()}>
        {loading ? "Creating..." : "Create Calendar"}
      </button>
      {error && <div>Error: {error}</div>}
      {success && <div>{success}</div>}
    </div>
  )
}