import {NextRequest} from "next/server";
import {githubApi} from "@/lib/api-client";

export async function GET(
  request: NextRequest,
) {
  try {
    const { searchParams } = new URL(request.url)

    const queryParams = {
      sort: searchParams.get("sort") || undefined,
      direction: searchParams.get("direction") || undefined,
      per_page: searchParams.get("per_page") ? Number(searchParams.get("per_page")) : undefined,
      type: searchParams.get("type") || undefined,
    }


      const result = await githubApi.getAuthUserRepos(queryParams)
      if (!result.success) {
        return Response.json({ error: result.error }, { status: result.status || 500 })
      }
      return Response.json(result.data)



  } catch (error) {
    console.error('Error fetching repositories:', error)
    return Response.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}