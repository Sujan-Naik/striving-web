"use client"

import { useState, useEffect } from "react"
import { googleApi } from "@/lib/api-client"

export interface MailItem {
  id: string
  subject: string
  snippet: string
  sender: string
  date: Date
  isRead: boolean
}

export function useGmail(maxResults = 10) {
  const [mail, setMail] = useState<MailItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMail = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get message list
      const messagesResult = await googleApi.gmail.getMessages({ maxResults })

      if (!messagesResult.success) {
        setError(messagesResult.error)
        return
      }

      const messageIds = messagesResult.data.messages || []
      const messages: MailItem[] = []

      // Fetch details for each message
      for (const item of messageIds) {
        const msgResult = await googleApi.gmail.getMessage(item.id)

        if (msgResult.success) {
          const msgData = msgResult.data
          const headers = msgData.payload.headers

          const subjectHeader = headers.find((h: any) => h.name === "Subject")
          const fromHeader = headers.find((h: any) => h.name === "From")
          const dateHeader = headers.find((h: any) => h.name === "Date")

          messages.push({
            id: item.id,
            subject: subjectHeader?.value || "(No Subject)",
            snippet: msgData.snippet || "",
            sender: fromHeader?.value || "(Unknown sender)",
            date: new Date(dateHeader?.value || Date.now()),
            isRead: !msgData.labelIds?.includes("UNREAD"),
          })
        }
      }

      setMail(messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMail()
  }, [maxResults])

  return { mail, loading, error, refetch: fetchMail }
}
