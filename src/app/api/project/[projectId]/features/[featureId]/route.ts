import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";

import featureService from "@/services/featureService";


export async function GET(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
      await dbConnect()
    const {featureId} = await params;
    const feature = await featureService.getFeatureById(featureId);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feature' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
      await dbConnect()
    const updateData = await request.json();
          const {featureId} = await params;

    const feature = await featureService.updateFeature(featureId, updateData);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
      await dbConnect()
        const {featureId} = await params;

    const deleted = await featureService.deleteFeature(featureId);
    if (!deleted) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
    await dbConnect()
    const updateData = await request.json();
    const {featureId} = await params;

    const feature = await featureService.updateFeature(featureId, updateData);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
  }
}