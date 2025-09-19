import { NextRequest, NextResponse } from 'next/server';
import { ProjectApplicationService } from '@/services/projectApplicationService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
      const {projectId} = await params;
    const applications = await ProjectApplicationService.getApplicationsByProject(projectId);
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { applicationId, status } = await request.json();
    const application = await ProjectApplicationService.updateApplicationStatus(applicationId, status);
    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update applications' }, { status: 500 });
  }
}