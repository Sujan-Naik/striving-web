import { googleApi } from "@/lib/api-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      maxResults: searchParams.get('maxResults') ? parseInt(searchParams.get('maxResults')!) : 10,
      q: searchParams.get('q') || undefined,
      labelIds: searchParams.get('labelIds')?.split(',') || undefined,
    }

    const result = await googleApi.gmail.getMessages(params)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch messages' },
        { status: result.status || 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Gmail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}