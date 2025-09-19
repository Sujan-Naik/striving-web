import { NextRequest, NextResponse } from 'next/server';
import { docsService } from '@/services/docsService';
import dbConnect from '@/lib/mongodb';
import projectService from "@/services/projectService";
import Docs from "@/models/Docs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string, docsId: string  }> }
) {
  try {
    await dbConnect();
    const { projectId, docsId} = await params;

    const { docsSections } = await request.json();

    const updatedDocs = await docsService.update(docsId, { docsSections: docsSections });
    console.log(updatedDocs)
    if (!updatedDocs) {
      return NextResponse.json({ error: 'Docs not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDocs);
  } catch (error) {
    console.error('Docs update error:', error);
    return NextResponse.json({ error: 'Failed to update docs section' }, { status: 500 });
  }
}