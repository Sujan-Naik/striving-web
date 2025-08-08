import { NextRequest, NextResponse } from 'next/server';
import { wikiService } from '@/services/wikiService';
import dbConnect from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const {projectId} = await params;
    const wikis = await wikiService.findByProject(projectId);
    if (wikis.length ==0){
      return NextResponse.json({ error: 'No Wiki found' }, { status: 404 });
    }
    return NextResponse.json(wikis[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project wikis' }, { status: 500 });
  }
}