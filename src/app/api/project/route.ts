import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import dbConnect from "@/lib/mongodb";

const projectService = new ProjectService();

export async function POST(request: NextRequest) {
  try {
      await dbConnect()
    const projectData = await request.json();
    const project = await projectService.createProject(projectData);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
      await dbConnect()
    console.log('connected');
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    if (ownerId) {
            console.log('getting projects')

      const projects = await projectService.getProjectsByOwner(ownerId);
      console.log('this')
      return NextResponse.json(projects);
    }

    return NextResponse.json({ error: 'ownerId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}