import { NextRequest, NextResponse } from 'next/server';
import { documentationSectionService } from '@/services/documentationSectionService';
import  projectService  from '@/services/projectService';


export async function GET(
  request: NextRequest,
  { params }: { params: {featureId: string } }
) {
        const {featureId} = await params;

  const sections = await documentationSectionService.findByFeature(featureId);
  return NextResponse.json(sections);
}
