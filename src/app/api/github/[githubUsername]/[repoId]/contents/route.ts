import {NextRequest, NextResponse} from 'next/server'
import {githubApi} from "@/lib/api-client"

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
    try {
        const {githubUsername, repoId} = await params
        const {searchParams} = new URL(request.url)

        const path = searchParams.get('path') || ''
        const branch = searchParams.get('branch') || 'main'

        if (!githubUsername || !repoId) {
            return NextResponse.json({error: 'Owner and repo required'}, {status: 400})
        }

        const response = await githubApi.getContents(githubUsername, repoId, path, branch)

        if (!response.success) {
            return NextResponse.json({error: response.error || 'Failed to fetch contents'}, {status: response.status || 500})
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error fetching contents:', error)
        return NextResponse.json({error: 'Failed to fetch contents'}, {status: 500})
    }
}
