import {NextRequest, NextResponse} from 'next/server'
import {githubApi} from "@/lib/api-client"

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
    try {
        console.log('fetching branches')
        const {githubUsername, repoId} = await params

        if (!githubUsername || !repoId) {
            return NextResponse.json({error: 'Owner and repo required'}, {status: 400})
        }

        const response = await githubApi.getBranches(githubUsername, repoId)

        if (!response.success) {
            return NextResponse.json({error: response.error || 'Failed to fetch branches'}, {status: response.status || 500})
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error fetching branches:', error)
        return NextResponse.json({error: 'Failed to fetch branches'}, {status: 500})
    }
}