import {NextRequest} from "next/server";
import {githubApi} from "@/lib/api-client";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        if (!data.name) {
            return Response.json({error: "Repository name is required"}, {status: 400})
        }

        const result = await githubApi.createRepo(data)

        if (!result.success) {
            return Response.json({error: result.error}, {status: result.status || 500})
        }

        return Response.json(result.data)
    } catch (error) {
        console.error('Error creating repository:', error)
        return Response.json({error: "Failed to create repository"}, {status: 500})
    }
}