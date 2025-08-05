import { NextRequest } from "next/server"
import { spotifyApi } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit")
  const offset = searchParams.get("offset")

  const params = {
    ...(limit && { limit: parseInt(limit) }),
    ...(offset && { offset: parseInt(offset) })
  }

  const result = await spotifyApi.getPlaylists(params)
  return Response.json(result)
}