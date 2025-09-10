import { googleApi } from "@/lib/api-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const result = await googleApi.calendar.createCalendar(body)

  if (!result.success) {
    return NextResponse.json(result, { status: result.status || 500 })
  }

  return NextResponse.json(result.data)
}