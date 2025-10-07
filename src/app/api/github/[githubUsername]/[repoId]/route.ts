import {NextRequest} from "next/server"
import {githubApi} from "@/lib/api-client"

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
    try {
        const {githubUsername, repoId} = await params

        if (!githubUsername || !repoId) {
            return Response.json({error: "Owner and repo are required"}, {status: 400})
        }

        const result = await githubApi.getRepo(githubUsername, repoId)

        if (!result.success) {
            return Response.json({error: result.error}, {status: result.status || 500})
        }

        return Response.json(result.data)
    } catch (error) {
        console.error('Error fetching repository:', error)
        return Response.json({error: "Failed to fetch repository"}, {status: 500})
    }
}
