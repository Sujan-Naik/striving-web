import { NextRequest } from "next/server"
import {githubApi} from "@/lib/api-client";


export async function GET(request: NextRequest,
  { params }: { params: { projectId: string } }
) {
    try {
        const result = await githubApi.getProjectV2ById(await params.projectId)
        if (!result.success) {
            return Response.json({error: result.error}, {status: result.status || 500})
        }

        return Response.json(result.data)
    } catch (error) {
        return Response.json({error: "Failed to fetch projects"}, {status: 500})
    }
}