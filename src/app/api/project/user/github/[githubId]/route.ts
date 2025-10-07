import {NextRequest, NextResponse} from 'next/server';
import userService from '@/services/userService';
import dbConnect from "@/lib/mongodb";

export async function GET(request: NextRequest, {params}: { params: Promise<{ githubId: string }> }) {
    try {
        await dbConnect()

        const {githubId} = await params
        const user = await userService.findByGithubId(githubId);
        if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch user'}, {status: 500});
    }
}