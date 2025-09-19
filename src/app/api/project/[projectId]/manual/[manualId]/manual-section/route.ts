import { NextRequest, NextResponse } from 'next/server';
import { manualService } from '@/services/manualService';
import dbConnect from '@/lib/mongodb';
import projectService from "@/services/projectService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string, manualId: string}> }
) {
  try {
    await dbConnect();
    const { projectId, manualId } = await params;

    const { manualSections } = await request.json();
    const project = await projectService.getProjectById(projectId);
    // console.log(project)
    if (!project?.manual) {
      return NextResponse.json({ error: 'Project or manual not found' }, { status: 404 });
    }

    // console.log(manualSections)
    const updatedManual = await manualService.update(manualId, { manualSections: manualSections });
    console.log(updatedManual)
    if (!updatedManual) {
      return NextResponse.json({ error: 'Manual not found' }, { status: 404 });
    }

    return NextResponse.json(updatedManual);
  } catch (error) {
    console.error('Manual update error:', error);
    return NextResponse.json({ error: 'Failed to update manual section' }, { status: 500 });
  }
}