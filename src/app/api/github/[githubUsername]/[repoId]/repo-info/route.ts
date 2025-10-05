import { NextRequest, NextResponse } from 'next/server'
import { githubApi } from "@/lib/api-client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ githubUsername: string; repoId: string }> }
) {
  try {
    const { githubUsername, repoId } = await params

    if (!githubUsername || !repoId) {
      return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 })
    }

    // This is essentially the same as the single repo endpoint
    // You might want to use getRepo here or create a separate method
    const response = await githubApi.getRepo(githubUsername, repoId)

    if (!response.success) {
      return NextResponse.json({ error: response.error || 'Failed to fetch repository info' }, { status: response.status || 500 })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching repository info:', error)
    return NextResponse.json({ error: 'Failed to fetch repository info' }, { status: 500 })
  }
}