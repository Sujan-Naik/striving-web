import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import dbConnect from "@/lib/mongodb";

const projectService = new ProjectService();

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    await dbConnect()

  } catch (error){
        return NextResponse.json({ error: 'MongoDB connection failed' }, { status: 500 });
  }
  try {
    const {projectId} = await params
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
      await dbConnect()
    const updates = await request.json();
    const project = await projectService.updateProject(params.projectId, updates);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
      await dbConnect()
    const deleted = await projectService.deleteProject(params.projectId);
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Project deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}