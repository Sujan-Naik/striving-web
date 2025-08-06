import { NextRequest, NextResponse } from 'next/server';
import DocsService from '@/services/docsService';
import dbConnect from "@/lib/mongodb";

export async function GET(request: NextRequest, { params }: { params: { wikiId: string } }) {
  try {
      await dbConnect()
    const docs = await DocsService.getDocsByWiki(params.wikiId);
    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get docs' }, { status: 500 });
  }
}