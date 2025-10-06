// app/api/github/pull-requests/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, {params} : {params: Promise<{githubUsername: string, repoId: string}> }) {
  const {githubUsername, repoId} = await params;

   const mockPRs = Array.from({ length: 5 }, (_, i) => ({
    number: 100 + i,
    title: `Fix bug in component`,
    state: Math.random() > 0.5 ? 'open' : 'closed',
    author: `developer${i + 1}`,
    url: `https://github.com/${githubUsername}/${repoId}/pull/${100 + i}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  return Response.json(mockPRs);
}

// import { NextRequest, NextResponse } from 'next/server'
// import { githubApi } from "@/lib/api-client"
//
// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ githubUsername: string; repoId: string }> }
// ) {
//   try {
//     const { githubUsername, repoId } = await params
//     const { searchParams } = new URL(request.url)
//
//     const state = searchParams.get('state') || 'open'
//     const per_page = searchParams.get('per_page') ? Number(searchParams.get('per_page')) : undefined
//
//     if (!githubUsername || !repoId) {
//       return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 })
//     }
//
//     const response = await githubApi.getPullRequests(githubUsername, repoId, { state, per_page })
//
//     if (!response.success) {
//       return NextResponse.json({ error: response.error || 'Failed to fetch pull requests' }, { status: response.status || 500 })
//     }
//
//     return NextResponse.json(response.data)
//   } catch (error) {
//     console.error('Error fetching pull requests:', error)
//     return NextResponse.json({ error: 'Failed to fetch pull requests' }, { status: 500 })
//   }
// }