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