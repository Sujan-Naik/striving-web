import { NextRequest, NextResponse } from 'next/server';
import { docsSectionService } from '@/services/docsSectionService';
import  projectService  from '@/services/projectService';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; sectionId: string } }
) {
  const {projectId, sectionId} = await params;
  const project = await projectService.getProjectById(projectId);
  const section = await docsSectionService.findById(sectionId);
  return NextResponse.json(section);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; sectionId: string } }
) {
  const {projectId, sectionId} = await params;

  const project = await projectService.getProjectById(projectId);
  const data = await request.json();

  const section = await docsSectionService.update(sectionId, data);
  return NextResponse.json(section);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; sectionId: string } }
) {
  const {projectId, sectionId} = await params;

  const project = await projectService.getProjectById(projectId);
  const success = await docsSectionService.delete(sectionId);
  return NextResponse.json({ success });
}
