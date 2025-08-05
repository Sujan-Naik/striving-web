import { googleApi } from "@/lib/api-client"
import { NextResponse } from "next/server"

export async function GET() {
  const result = await googleApi.gmail.getProfile()

  if (!result.success) {
    return NextResponse.json(result, { status: result.status || 500 })
  }

  return NextResponse.json(result.data)
}