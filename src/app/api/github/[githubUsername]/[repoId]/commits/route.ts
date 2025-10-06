import { NextRequest, NextResponse } from 'next/server'
import { githubApi } from "@/lib/api-client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
  try {
    const { githubUsername, repoId } = await params
    const { searchParams } = new URL(request.url)

    const sha = searchParams.get('sha') || undefined
    const path = searchParams.get('path') || undefined
    const per_page = searchParams.get('per_page') ? Number(searchParams.get('per_page')) : undefined

    if (!githubUsername || !repoId) {
      return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 })
    }

    const response = await githubApi.getCommits(githubUsername, repoId, { sha, path, per_page })

    if (!response.success) {
      return NextResponse.json({ error: response.error || 'Failed to fetch commits' }, { status: response.status || 500 })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching commits:', error)
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 })
  }
}
