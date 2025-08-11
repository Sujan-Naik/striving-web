import {NextRequest, NextResponse} from "next/server";
import {ProjectApplicationService} from "@/services/projectApplicationService";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string, userId: string } }
) {
  try {

      const {projectId, userId} = await params;
    const { message } = await request.json();
    const application = await ProjectApplicationService.createApplication(
      projectId,
      userId,
      message
    );

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create applications' }, { status: 500 });
  }
}