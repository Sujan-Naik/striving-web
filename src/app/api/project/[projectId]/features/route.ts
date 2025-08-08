import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/featureService';
import dbConnect from "@/lib/mongodb";

const featureService = new FeatureService();

export async function POST(request: NextRequest) {
  try {
      await dbConnect()
    const featureData = await request.json();
    const feature = await featureService.createFeature(featureData);
    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
      await dbConnect()
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      const features = await featureService.getFeaturesByProject(projectId);
      return NextResponse.json(features);
    }

    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}