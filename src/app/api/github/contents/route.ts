// app/api/github/contents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {githubApi} from "@/lib/api-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const path = searchParams.get('path') || '';
  const branch = searchParams.get('branch') || 'main';

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Owner and repo required' }, { status: 400 });
  }

  const response = await githubApi.getContents(owner, repo, path, branch)
    if (!response.success){
        return NextResponse.json({ success: false, error: 'Failed to fetch contents' }, { status: 500 });
    }
    return NextResponse.json(response);
}