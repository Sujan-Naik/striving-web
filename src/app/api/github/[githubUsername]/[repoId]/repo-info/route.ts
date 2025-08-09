// app/api/github/repo-info/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  const mockRepoInfo = {
    name: 'mock-repo',
    fullName: 'owner/mock-repo',
    url: 'https://github.com/owner/mock-repo',
    defaultBranch: 'main'
  };

  return Response.json(mockRepoInfo);
}