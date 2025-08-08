import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/featureService';
import dbConnect from "@/lib/mongodb";

const featureService = new FeatureService();

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
      await dbConnect()
    const { commitSha } = await request.json();
    const feature = await featureService.addCommitSha(params.projectId, commitSha);
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add commit' }, { status: 500 });
  }
}