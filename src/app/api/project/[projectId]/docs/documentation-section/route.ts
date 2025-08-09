import { NextRequest, NextResponse } from 'next/server';
import { docsService } from '@/services/docsService';
import dbConnect from '@/lib/mongodb';
import projectService from "@/services/projectService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const { projectId } = await params;

    const { documentationSection } = await request.json();
    const project = await projectService.getProjectById(projectId);
    console.log(project)
    if (!project?.docs) {
      return NextResponse.json({ error: 'Project or docs not found' }, { status: 404 });
    }

    const updatedDocs = await docsService.update(project.docs, { documentationSection });

    if (!updatedDocs) {
      return NextResponse.json({ error: 'Docs not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDocs);
  } catch (error) {
    console.error('Docs update error:', error);
    return NextResponse.json({ error: 'Failed to update docs section' }, { status: 500 });
  }
}