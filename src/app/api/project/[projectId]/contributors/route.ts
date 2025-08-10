import { NextRequest, NextResponse } from 'next/server';
import projectService from '@/services/projectService';
import dbConnect from "@/lib/mongodb";


export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
      await dbConnect()
    const { contributorId } = await request.json();
      const {projectId} = await params;
    const project = await projectService.addContributor(projectId, contributorId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add contributor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
      await dbConnect()
    const {projectId} = await params;
    const { contributorId } = await request.json();
    const project = await projectService.removeContributor(projectId, contributorId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await projectService.removeContributor(projectId, contributorId)
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove contributor' }, { status: 500 });
  }
}


export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
      await dbConnect()
    const {projectId} = await params;
    const contributors = await projectService.getContributors(projectId);
    if (!contributors) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(contributors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove contributor' }, { status: 500 });
  }
}