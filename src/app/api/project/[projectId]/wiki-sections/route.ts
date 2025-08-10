import { NextRequest, NextResponse } from 'next/server';
import { wikiSectionService } from '@/services/wikiSectionService';
import  projectService  from '@/services/projectService';
import {documentationSectionService} from "@/services/documentationSectionService";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {

  const data = await request.json();

  const section = await wikiSectionService.create(data);
  return NextResponse.json(section);
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { wikiSections } = await request.json();

    const updatedSections = await Promise.all(
      wikiSections.map(async (section: any) => {
        return await wikiSectionService.update(
          section._id,
          { ...section, updatedAt: new Date() },
        );
      })
    );

    return NextResponse.json({ wikiSections: updatedSections });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update wiki sections' },
      { status: 500 }
    );
  }
}