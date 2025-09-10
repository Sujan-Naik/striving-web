import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongodb";
import projectService from "@/services/projectService";
import {manualService} from "@/services/manualService";

export async function GET(request: NextRequest, { params }: { params: { projectId: string, manualId: string } }) {
  try {
    await dbConnect()

  } catch (error){
        return NextResponse.json({ error: 'MongoDB connection failed' }, { status: 500 });
  }
  try {
    const {manualId} = await params
    // const project = await projectService.getProjectById(projectId, ['members', 'owner']);
    const manual = await manualService.getById(manualId)
    if (!manual) {
      return NextResponse.json({ error: 'Manual not found' }, { status: 404 });
    }
    return NextResponse.json(manual);
  } catch (error) {
  //   console.log(error)
    return NextResponse.json({ error: 'Failed to fetch Manual' }, { status: 500 });
  }
}



