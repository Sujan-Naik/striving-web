import { NextRequest, NextResponse } from 'next/server';
import DocsService from '@/services/docsService';

export async function PUT(request: NextRequest, { params }: { params: { id: string; sectionId: string } }) {
  try {
    const updates = await request.json();
    const doc = await DocsService.updateSection(params.id, params.sectionId, updates);
    if (!doc) return NextResponse.json({ error: 'Doc or section not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; sectionId: string } }) {
  try {
    const doc = await DocsService.removeSection(params.id, params.sectionId);
    if (!doc) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove section' }, { status: 500 });
  }
}