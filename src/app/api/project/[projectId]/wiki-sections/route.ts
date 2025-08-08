import { NextRequest, NextResponse } from 'next/server';
import { wikiSectionService } from '@/services/wikiSectionService';
import  projectService  from '@/services/projectService';

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {

  const data = await request.json();

  const section = await wikiSectionService.create(data);
  return NextResponse.json(section);
}
