import { NextRequest, NextResponse } from 'next/server';
import DocsService from '@/services/docsService';
import dbConnect from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
      await dbConnect()
    const { wikiId, content, sections } = await request.json();
    const doc = await DocsService.createDoc(wikiId, content, sections);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create doc' }, { status: 500 });
  }
}

