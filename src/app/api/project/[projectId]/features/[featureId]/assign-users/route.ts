import { NextRequest, NextResponse } from 'next/server';
import featureService from '@/services/featureService';
import dbConnect from "@/lib/mongodb";

import featureService from "@/services/featureService";


export async function PUT(request: NextRequest, { params }: { params: { featureId: string } }) {
  try {
      await dbConnect()
    const { userIds } = await request.json();
            const {featureId} = await params;

    const feature = await featureService.assignUsers(featureId, userIds);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign users' }, { status: 500 });
  }
}