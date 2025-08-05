import { NextRequest } from "next/server"
import { spotifyApi } from "@/lib/api-client"

export async function GET() {
  const result = await spotifyApi.getCurrentPlayback()
  return Response.json(result)
}

export async function POST(request: NextRequest) {
  const { action, contextUri } = await request.json()

  let result
  switch (action) {
    case "play":
      result = await spotifyApi.play()
      break
    case "pause":
      result = await spotifyApi.pause()
      break
    case "next":
      result = await spotifyApi.next()
      break
    case "previous":
      result = await spotifyApi.previous()
      break
    case "playContext":
      result = await spotifyApi.playContext(contextUri)
      break
    default:
      return Response.json({ success: false, error: "Invalid action" }, { status: 400 })
  }

  return Response.json(result)
}