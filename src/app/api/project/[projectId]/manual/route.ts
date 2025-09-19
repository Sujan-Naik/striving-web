import { NextRequest, NextResponse } from 'next/server';
import {manualService} from '@/services/manualService';
import dbConnect from '@/lib/mongodb';
import Manual from "@/models/Manual";
import {Types} from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await dbConnect();
    const {projectId} = await params;
    const manual = await manualService.getByProject(projectId);
    if (manual.length ==0){
      return NextResponse.json({ error: 'No Manual found' }, { status: 404 });
    }
    return NextResponse.json(manual[0]);
  } catch (error) {
        console.error('Manual fetch error:', error); // Add this line
    return NextResponse.json({ error: 'Failed to fetch project manual' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const body = await request.json();

    const manualData = {
      project: projectId,
      content: body.content || '',
      manualSection: body.manualSections || []
    };

    const manual = await manualService.create(manualData);
    return NextResponse.json(manual, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create manual' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const body = await request.json();

    // Find manual by project ID first
    const existingManual = await Manual.findOne({ project: projectId });
    if (!existingManual) {
      return NextResponse.json({ error: 'Manual not found' }, { status: 404 });
    }

    // Update using the manual's _id
    const updatedManual = await manualService.update((existingManual._id as Types.ObjectId), body);
    return NextResponse.json(updatedManual);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update manual' }, { status: 500 });
  }
}