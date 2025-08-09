import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/featureService';
import dbConnect from "@/lib/mongodb";

const featureService = new FeatureService();

export async function PUT(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
      await dbConnect()
    const { prNumber } = await request.json();
            const {featureId} = await params;

    const feature = await featureService.addPullRequest(featureId, prNumber);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add pull request' }, { status: 500 });
  }
}