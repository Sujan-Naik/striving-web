import { NextRequest, NextResponse } from 'next/server';
import { wikiService } from '@/services/wikiService';
import dbConnect from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const wiki = await wikiService.findById(params.id);
    if (!wiki) {
      return NextResponse.json({ error: 'Wiki not found' }, { status: 404 });
    }
    return NextResponse.json(wiki);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wiki' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const data = await request.json();
    const wiki = await wikiService.update(params.id, data);
    if (!wiki) {
      return NextResponse.json({ error: 'Wiki not found' }, { status: 404 });
    }
    return NextResponse.json(wiki);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update wiki' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const wiki = await wikiService.delete(params.id);
    if (!wiki) {
      return NextResponse.json({ error: 'Wiki not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Wiki deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wiki' }, { status: 500 });
  }
}