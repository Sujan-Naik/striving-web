import { NextRequest, NextResponse } from 'next/server';
import projectService from '@/services/projectService';
import dbConnect from "@/lib/mongodb";


export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
      await dbConnect()
    const { contributorId } = await request.json();
      const {projectId} = await params;
    const project = await projectService.addMember(projectId, contributorId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
      await dbConnect()
    const {projectId} = await params;
    const { contributorId } = await request.json();
    const project = await projectService.removeMember(projectId, contributorId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await projectService.removeMember(projectId, contributorId)
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}


export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
      await dbConnect()
    const {projectId} = await params;
    const members = await projectService.getMembers(projectId);
    if (!members) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}