import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";

import featureService from "@/services/featureService";


export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const featureData = await request.json();
    const feature = await featureService.createFeature({ ...featureData, project: projectId });
    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const features = await featureService.getFeaturesByProject(projectId);
    return NextResponse.json(features);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}