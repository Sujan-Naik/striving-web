import { NextRequest, NextResponse } from 'next/server';
import { documentationSectionService } from '@/services/documentationSectionService';
import  projectService  from '@/services/projectService';


export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; featureId: string } }
) {
  const project = await projectService.getProjectById(params.projectId);
  const sections = await documentationSectionService.findByFeature(params.featureId);
  return NextResponse.json(sections);
}
