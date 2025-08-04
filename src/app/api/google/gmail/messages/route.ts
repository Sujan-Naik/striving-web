import { googleApi } from "@/lib/api-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params = {
    maxResults: searchParams.get('maxResults') ? parseInt(searchParams.get('maxResults')!) : undefined,
    q: searchParams.get('q') || undefined,
    labelIds: searchParams.get('labelIds')?.split(',') || undefined,
  }

  const result = await googleApi.gmail.getMessages(params)

  if (!result.success) {
    return NextResponse.json(result, { status: result.status || 500 })
  }

  return NextResponse.json(result.data)
}