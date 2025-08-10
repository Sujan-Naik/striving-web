import { NextRequest, NextResponse } from 'next/server';
import { wikiService } from '@/services/wikiService';
import dbConnect from '@/lib/mongodb';
import projectService from "@/services/projectService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const { projectId } = await params;

    const { wikiSections } = await request.json();
    const project = await projectService.getProjectById(projectId);
    if (!project?.wiki) {
      return NextResponse.json({ error: 'Project or wiki not found' }, { status: 404 });
    }

    const updatedWiki = await wikiService.update(project.wiki, { wikiSections: wikiSections });

    if (!updatedWiki) {
      return NextResponse.json({ error: 'Wiki not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWiki);
  } catch (error) {
    console.error('Wiki update error:', error);
    return NextResponse.json({ error: 'Failed to update wiki section' }, { status: 500 });
  }
}