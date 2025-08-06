import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import dbConnect from "@/lib/mongodb";

const projectService = new ProjectService();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const { contributorId } = await request.json();
    const project = await projectService.addContributor(params.id, contributorId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add contributor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const { contributorId } = await request.json();
    const project = await projectService.removeContributor(params.id, contributorId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove contributor' }, { status: 500 });
  }
}