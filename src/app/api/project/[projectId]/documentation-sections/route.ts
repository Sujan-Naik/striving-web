import { NextRequest, NextResponse } from 'next/server';
import { documentationSectionService } from '@/services/documentationSectionService';
import  projectService  from '@/services/projectService';

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {

  const data = await request.json();

  const section = await documentationSectionService.create(data);
  return NextResponse.json(section);
}
