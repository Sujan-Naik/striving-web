import {NextRequest, NextResponse} from "next/server";
import dbConnect from "@/lib/mongodb";
import {docsService} from "@/services/docsService";

export async function GET(request: NextRequest, {params}: { params: Promise<{ projectId: string, docsId: string }> }) {
    try {
        await dbConnect()

    } catch (error) {
        return NextResponse.json({error: 'MongoDB connection failed'}, {status: 500});
    }
    try {
        const {docsId} = await params
        // const project = await projectService.getProjectById(projectId, ['members', 'owner']);
        const docs = await docsService.getById(docsId)
        if (!docs) {
            return NextResponse.json({error: 'Docs not found'}, {status: 404});
        }
        return NextResponse.json(docs);
    } catch (error) {
        //   console.log(error)
        return NextResponse.json({error: 'Failed to fetch Docs'}, {status: 500});
    }
}



