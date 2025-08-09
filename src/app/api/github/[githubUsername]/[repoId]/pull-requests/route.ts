// app/api/github/pull-requests/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, params : {githubUsername: string, repoId: string}) {
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