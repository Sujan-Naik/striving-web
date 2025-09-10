import { NextRequest } from "next/server"
import { githubApi } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")

    const params = {
      sort: searchParams.get("sort") || undefined,
      direction: searchParams.get("direction") || undefined,
      per_page: searchParams.get("per_page") ? Number(searchParams.get("per_page")) : undefined,
      type: searchParams.get("type") || undefined,
    }

    // auth user repos
    if (!owner) {

      const result = await githubApi.getAuthUserRepos(params)
      if (!result.success) {
        return Response.json({ error: result.error }, { status: result.status || 500 })
      }

      return Response.json(result.data)
    }



    const result = await githubApi.getRepos(owner, params)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status || 500 })
    }

    return Response.json(result.data)
  } catch (error) {
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
    return Response.json({ error: "Failed to create repository" }, { status: 500 })
  }
}