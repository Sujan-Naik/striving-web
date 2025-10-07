import {NextRequest, NextResponse} from 'next/server';
import {ProjectService} from '@/services/projectService';
import dbConnect from "@/lib/mongodb";

const projectService = new ProjectService();

export async function POST(request: NextRequest) {
    try {
        await dbConnect()
        const projectData = await request.json();
        console.log(projectData)
        const project = await projectService.createProject(projectData);
        return NextResponse.json(project, {status: 201});
    } catch (error) {
        return NextResponse.json({error: 'Failed to create project'}, {status: 500});
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect()
        console.log('connected');
        const {searchParams} = new URL(request.url);
        const ownerId = searchParams.get('ownerId');
        console.log('get ownerId');

        if (ownerId) {
            console.log('ownerId');

            const projects = await projectService.getProjectsByOwner(ownerId);
            return NextResponse.json(projects);
        } else {
            console.log('!ownerId');

            const projects = await projectService.getProjects();
            return NextResponse.json(projects);
        }

        // return NextResponse.json({ error: 'ownerId required' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({error: `Failed to fetch projects: ${error}`}, {status: 500});
    }
}