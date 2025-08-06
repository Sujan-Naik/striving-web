import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/featureService';

const featureService = new FeatureService();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { state } = await request.json();
    const feature = await featureService.updateState(params.id, state);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}