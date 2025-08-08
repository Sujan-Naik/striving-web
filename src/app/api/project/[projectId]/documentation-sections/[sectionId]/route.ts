import { NextRequest, NextResponse } from 'next/server';
import { documentationSectionService } from '@/services/documentationSectionService';
import  projectService  from '@/services/projectService';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; sectionId: string } }
) {
  const {projectId, sectionId} = await params;
  const project = await projectService.getProjectById(projectId);
  const section = await documentationSectionService.findById(sectionId);
  return NextResponse.json(section);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; sectionId: string } }
) {
  const {projectId, sectionId} = await params;

  const project = await projectService.getProjectById(projectId);
  const data = await request.json();

  const section = await documentationSectionService.update(sectionId, data);
  return NextResponse.json(section);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; sectionId: string } }
) {
  const {projectId, sectionId} = await params;

  const project = await projectService.getProjectById(projectId);
  const success = await documentationSectionService.delete(sectionId);
  return NextResponse.json({ success });
}
