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


export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { documentationSections } = await request.json();

    const updatedSections = await Promise.all(
      documentationSections.map(async (section: any) => {
        return await documentationSectionService.update(
          section._id,
          { ...section, updatedAt: new Date() },
        );
      })
    );

    return NextResponse.json({ documentationSections: updatedSections });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update documentation sections' },
      { status: 500 }
    );
  }
}