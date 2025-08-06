import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';

const projectService = new ProjectService();

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const project = await projectService.createProject(projectData);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    if (ownerId) {
      const projects = await projectService.getProjectsByOwner(ownerId);
      return NextResponse.json(projects);
    }

    return NextResponse.json({ error: 'ownerId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}