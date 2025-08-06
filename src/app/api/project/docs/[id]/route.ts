import { NextRequest, NextResponse } from 'next/server';
import DocsService from '@/services/docsService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doc = await DocsService.getDocById(params.id);
    if (!doc) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get doc' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json();
    const doc = await DocsService.updateDoc(params.id, updates);
    if (!doc) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update doc' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doc = await DocsService.deleteDoc(params.id);
    if (!doc) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    return NextResponse.json({ message: 'Doc deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete doc' }, { status: 500 });
  }
}