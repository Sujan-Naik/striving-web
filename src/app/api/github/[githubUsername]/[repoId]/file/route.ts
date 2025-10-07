import {NextRequest, NextResponse} from 'next/server'
import {githubApi} from "@/lib/api-client"

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
    try {
        const {githubUsername, repoId} = await params
        const {searchParams} = new URL(request.url)

        const path = searchParams.get('path')
        const branch = searchParams.get('branch') || 'main'

        if (!githubUsername || !repoId) {
            return NextResponse.json({error: 'Owner and repo required'}, {status: 400})
        }

        if (!path) {
            return NextResponse.json({error: 'File path required'}, {status: 400})
        }

        const response = await githubApi.getFile(githubUsername, repoId, path, branch)

        if (!response.success) {
            return NextResponse.json({error: response.error || 'Failed to fetch file'}, {status: response.status || 500})
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error fetching file:', error)
        return NextResponse.json({error: 'Failed to fetch file'}, {status: 500})
    }
}

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
    try {
        const {githubUsername, repoId} = await params
        const body = await request.json()

        const {path, message, content, sha, branch = 'main'} = body

        if (!githubUsername || !repoId) {
            return NextResponse.json({error: 'Owner and repo required'}, {status: 400})
        }

        if (!path || !message || content === undefined) {
            return NextResponse.json({error: 'Path, message and content are required'}, {status: 400})
        }

        const response = await githubApi.updateFile(githubUsername, repoId, path, {
            message,
            content: btoa(content),
            sha,
            branch
        })

        if (!response.success) {
            return NextResponse.json({error: response.error || 'Failed to update file'}, {status: response.status || 500})
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error updating file:', error)
        return NextResponse.json({error: 'Failed to update file'}, {status: 500})
    }
}
