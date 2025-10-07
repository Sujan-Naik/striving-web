import {NextRequest, NextResponse} from 'next/server';
import projectService from '@/services/projectService';
import dbConnect from "@/lib/mongodb";


export async function GET(request: NextRequest, {params}: { params: Promise<{ projectId: string }> }) {
    try {
        await dbConnect()

    } catch (error) {
        return NextResponse.json({error: 'MongoDB connection failed'}, {status: 500});
    }
    try {
        const {projectId} = await params
        // const project = await projectService.getProjectById(projectId, ['members', 'owner']);
        const project = await projectService.getProjectByName(projectId, ['members', 'owner', 'docs', 'manual']);
        if (!project) {
            return NextResponse.json({error: 'Project not found'}, {status: 404});
        }
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch project'}, {status: 500});
    }
}

export async function PUT(request: NextRequest, {params}: { params: Promise<{ projectId: string }> }) {
    try {
        await dbConnect()
        const updates = await request.json();
        const {projectId} = await params;
        const project = await projectService.updateProject(projectId, updates);
        if (!project) {
            return NextResponse.json({error: 'Project not found'}, {status: 404});
        }
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({error: 'Failed to update project'}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, {params}: { params: Promise<{ projectId: string }> }) {
    try {
        await dbConnect()
        const {projectId} = await params;
        const deleted = await projectService.deleteProject(projectId);
        if (!deleted) {
            return NextResponse.json({error: 'Project not found'}, {status: 404});
        }
        return NextResponse.json({message: 'Project deleted'});
    } catch (error) {
        return NextResponse.json({error: 'Failed to delete project'}, {status: 500});
    }
}