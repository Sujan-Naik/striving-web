import { NextRequest, NextResponse } from 'next/server';
import userService from '@/services/userService';

export async function GET(request: NextRequest, { params }: { params: { githubId: string } }) {
  try {
    const user = await userService.findByGithubId(params.githubId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}