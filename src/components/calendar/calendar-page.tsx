"use client"

import {useCalendar} from "@/hooks/use-calendar"
import {HeadedButton, HeadedDialog, VariantEnum} from "headed-ui"
import {AlertCircle, Calendar, RefreshCw} from "lucide-react"
import {useState} from "react";
import CreateCalendarEvent from "@/components/calendar/create-calendar-event";
import {HeadedCalendar} from "@/components/calendar/headed-calendar";

export default function CalendarPage() {
    const calendarId = "primary";
  const { events, loading, error, refetch } = useCalendar(calendarId)
    // console.log(events);

    const [dialogOpen, setDialog] = useState(false)
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <HeadedDialog title={"Error Fetching Calendar"} isOpen={dialogOpen} onClick={() => setDialog(false)} variant={VariantEnum.Outline} >
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </HeadedDialog>
        <HeadedButton onClick={refetch} variant={VariantEnum.Outline}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </HeadedButton>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Google Calendar
        </h1>
          {!loading &&
              <HeadedButton onClick={refetch} variant={VariantEnum.Outline}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </HeadedButton>
          }

      </div>

      {loading && events.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading calendar events...</p>
          </div>
        </div>
      ) : (


        <HeadedCalendar changeCallback={refetch} variant={VariantEnum.Primary} calendarId={calendarId} events={events} />
      )}
    </div>
  )
}
