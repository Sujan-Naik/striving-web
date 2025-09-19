import { NextRequest, NextResponse } from 'next/server';
import { manualSectionService } from '@/services/manualSectionService';
import  projectService  from '@/services/projectService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {

  const data = await request.json();

  const section = await manualSectionService.create(data);
  return NextResponse.json(section);
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { manualSections } = await request.json();

    const updatedSections = await Promise.all(
      manualSections.map(async (section: any) => {
        return await manualSectionService.update(
          section._id,
          { ...section, updatedAt: new Date() },
        );
      })
    );

    return NextResponse.json({ manualSections: updatedSections });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update manual sections' },
      { status: 500 }
    );
  }
}