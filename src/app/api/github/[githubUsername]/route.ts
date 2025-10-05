import { NextRequest } from "next/server"
import { githubApi } from "@/lib/api-client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ githubUsername: string }> }
) {
  try {
    const { githubUsername } = await params
    const { searchParams } = new URL(request.url)

    const queryParams = {
      sort: searchParams.get("sort") || undefined,
      direction: searchParams.get("direction") || undefined,
      per_page: searchParams.get("per_page") ? Number(searchParams.get("per_page")) : undefined,
      type: searchParams.get("type") || undefined,
    }

    // If no githubUsername or it's 'me', fetch auth user repos
    if (!githubUsername || githubUsername === 'me') {
      const result = await githubApi.getAuthUserRepos(queryParams)
      if (!result.success) {
        return Response.json({ error: result.error }, { status: result.status || 500 })
      }
      return Response.json(result.data)
    }

    // Fetch specific user's repos
    const result = await githubApi.getRepos(githubUsername, queryParams)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status || 500 })
    }

    return Response.json(result.data)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return Response.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.name) {
      return Response.json({ error: "Repository name is required" }, { status: 400 })
    }

    const result = await githubApi.createRepo(data)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status || 500 })
    }

    return Response.json(result.data)
  } catch (error) {
    console.error('Error creating repository:', error)
    return Response.json({ error: "Failed to create repository" }, { status: 500 })
  }
}