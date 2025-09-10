import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import featureService from "@/services/featureService";


export async function PUT(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
      await dbConnect()
    const { state } = await request.json();
      const {featureId} = await params;
    const feature = await featureService.updateState(featureId, state);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}