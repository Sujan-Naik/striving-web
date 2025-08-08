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
    const wikis = await wikiService.getByProject(projectId);
    if (wikis.length ==0){
      return NextResponse.json({ error: 'No Wiki found' }, { status: 404 });
    }
    return NextResponse.json(wikis[0]);
  } catch (error) {
        console.error('Wiki fetch error:', error); // Add this line
    return NextResponse.json({ error: 'Failed to fetch project wikis' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const body = await request.json();

    const wikiData = {
      project: projectId,
      content: body.content || '',
      wikiSection: body.wikiSection || []
    };

    const wiki = await wikiService.create(wikiData);
    return NextResponse.json(wiki, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create wiki' }, { status: 500 });
  }
}