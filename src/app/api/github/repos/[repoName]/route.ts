import {NextRequest} from "next/server";
import {githubApi} from "@/lib/api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoName: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")

    if (!owner) {
      return Response.json({ error: "Owner parameter is required" }, { status: 400 })
    }

    const {repoName} = await params

    const result = await githubApi.getRepo(owner, repoName)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status || 500 })
    }

    return Response.json(result.data)
  } catch (error) {
    return Response.json({ error: "Failed to fetch repository" }, { status: 500 })
  }
}