import { NextRequest } from "next/server"
import {githubApi} from "@/lib/api-client";


export async function GET() {
  try {
    const result = await githubApi.getProjectsV2()

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status || 500 })
    }

    return Response.json(result.data)
  } catch (error) {
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 })
    }

    const result = await githubApi.createProjectV2(title)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: "status" in result && result.status || 500 })
    }

    return Response.json(result.success)
  } catch (error) {
    return Response.json({ error: "Failed to create project" }, { status: 500 })
  }
}