import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/featureService';
import dbConnect from "@/lib/mongodb";

const featureService = new FeatureService();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
      await dbConnect()
    const { userIds } = await request.json();
    const feature = await featureService.assignUsers(params.id, userIds);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign users' }, { status: 500 });
  }
}