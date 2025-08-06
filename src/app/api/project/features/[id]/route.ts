import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/featureService';
import dbConnect from "@/lib/mongodb";

const featureService = new FeatureService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const feature = await featureService.getFeatureById(params.id);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feature' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const updateData = await request.json();
    const feature = await featureService.updateFeature(params.id, updateData);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const deleted = await featureService.deleteFeature(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
  }
}