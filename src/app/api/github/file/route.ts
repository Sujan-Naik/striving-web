// app/api/github/file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { githubApi } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const path = searchParams.get('path') || '';
  const branch = searchParams.get('branch') || 'main';

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 });
  }


  const response = await githubApi.getFile(owner, repo, path, branch);

  if (!response.success){
        return NextResponse.json({ success: false, error: 'Failed to fetch contents' }, { status: 500 });
    }

  return NextResponse.json(response);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  console.log(body)
  const { owner, repo, path, message, content, sha, branch = 'main' } = body;

  if (!owner || !repo || !path || !message || !content) {
    return NextResponse.json({ error: 'Owner, repo, path, message and content required' }, { status: 400 });
  }

  try {
    const response = await githubApi.updateFile(owner, repo, path, {
      message,
      content: btoa(content), // Encode here
      sha,
      branch
    });

    if (!response.success) {
      return NextResponse.json({ success: false, error: 'Failed to update file' }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update file' }, { status: 500 });
  }
}