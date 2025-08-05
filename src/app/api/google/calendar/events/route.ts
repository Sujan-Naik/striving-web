import { googleApi } from "@/lib/api-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params = {
    maxResults: searchParams.get('maxResults') ? parseInt(searchParams.get('maxResults')!) : undefined,
    timeMin: searchParams.get('timeMin') || undefined,
    timeMax: searchParams.get('timeMax') || undefined,
    singleEvents: searchParams.get('singleEvents') === 'true',
    orderBy: searchParams.get('orderBy') as "startTime" | "updated" || undefined,
    calendarId: searchParams.get('calendarId') || undefined,
  }

  const result = await googleApi.calendar.getEvents(params)

  console.log(result)
  if (!result.success) {
    return NextResponse.json(result, { status: result.status || 500 })
  }

  return NextResponse.json(result.data)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const eventId = searchParams.get('eventId')
  const calendarId = searchParams.get('calendarId')

  if (!eventId || !calendarId) {
    return NextResponse.json({ error: 'eventId and calendarId required' }, { status: 400 })
  }

  const result = await googleApi.calendar.deleteEvent({
    eventId,
    calendarId
  })

  if (!result.success) {
    return NextResponse.json(result, { status: result.status || 500 })
  }

  return NextResponse.json({ success: true })
}