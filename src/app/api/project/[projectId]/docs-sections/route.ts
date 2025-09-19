import { NextRequest, NextResponse } from 'next/server';
import { docsSectionService } from '@/services/docsSectionService';
import  projectService  from '@/services/projectService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {

  const data = await request.json();

  const section = await docsSectionService.create(data);
  return NextResponse.json(section);
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { docsSections } = await request.json();

    const updatedSections = await Promise.all(
      docsSections.map(async (section: any) => {
        return await docsSectionService.update(
          section._id,
          { ...section, updatedAt: new Date() },
        );
      })
    );

    return NextResponse.json({ docsSections: updatedSections });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update docs sections' },
      { status: 500 }
    );
  }
}