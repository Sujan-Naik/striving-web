import { NextRequest, NextResponse } from 'next/server';
import {docsService} from '@/services/docsService';
import dbConnect from '@/lib/mongodb';
import Docs from "@/models/Docs";
import {Types} from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const {projectId} = await params;
    const docs = await docsService.getByProject(projectId);
    if (docs.length ==0){
      return NextResponse.json({ error: 'No Docs found' }, { status: 404 });
    }
    return NextResponse.json(docs[0]);
  } catch (error) {
        console.error('Docs fetch error:', error); // Add this line
    return NextResponse.json({ error: 'Failed to fetch project docs' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const body = await request.json();

    const docsData = {
      project: projectId,
      content: body.content || '',
      documentationSection: body.documentationSection || []
    };

    const docs = await docsService.create(docsData);
    return NextResponse.json(docs, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create docs' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();
    const { projectId } = await params;
    const body = await request.json();

    // Find docs by project ID first
    const existingDocs = await Docs.findOne({ project: projectId });
    if (!existingDocs) {
      return NextResponse.json({ error: 'Docs not found' }, { status: 404 });
    }

    // Update using the docs's _id
    const updatedDocs = await docsService.update((existingDocs._id as Types.ObjectId), body);
    return NextResponse.json(updatedDocs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update docs' }, { status: 500 });
  }
}