import { NextRequest, NextResponse } from 'next/server';
import { documentationSectionService } from '@/services/documentationSectionService';
import  projectService  from '@/services/projectService';


export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {

  const {projectId} = await params;

  const project = await projectService.getProjectById(projectId);
  const { featureId, sectionIds } = await request.json();

  await documentationSectionService.reorder(featureId, sectionIds);
  return NextResponse.json({ success: true });
}