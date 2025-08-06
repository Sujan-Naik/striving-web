import { NextRequest, NextResponse } from 'next/server';
import DocsService from '@/services/docsService';
import dbConnect from "@/lib/mongodb";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const section = await request.json();
    const doc = await DocsService.addSection(params.id, section);
    if (!doc) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add section' }, { status: 500 });
  }
}