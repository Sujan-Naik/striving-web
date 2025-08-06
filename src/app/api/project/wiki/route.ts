import { NextRequest, NextResponse } from 'next/server';
import { wikiService } from '@/services/wikiService';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const wikis = await wikiService.findAll();
    return NextResponse.json(wikis);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wikis' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const wiki = await wikiService.create(data);
    return NextResponse.json(wiki, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create wiki' }, { status: 500 });
  }
}