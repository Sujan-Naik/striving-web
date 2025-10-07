import {githubApi} from "@/lib/api-client";

export async function GET() {
    try {
        const result = await githubApi.getAuthOwner()

        if (!result.success) {
            return Response.json({error: result.error}, {status: result.status || 500})
        }

        return Response.json(result.data)
    } catch (error) {
        return Response.json({error: "Failed to fetch authenticated user"}, {status: 500})
    }
}