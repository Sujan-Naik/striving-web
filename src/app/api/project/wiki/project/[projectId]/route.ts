import { NextRequest, NextResponse } from 'next/server';
import { wikiService } from '@/services/wikiService';
import dbConnect from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const wikis = await wikiService.findByProject(params.projectId);
    return NextResponse.json(wikis);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project wikis' }, { status: 500 });
  }
}