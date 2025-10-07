// /api/user/[userId]/applications/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {ProjectApplicationService} from '@/services/projectApplicationService';
import dbconnect from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ userId: string }> }
) {
    try {
        await dbconnect();
        const {userId} = await params
        const applications = await ProjectApplicationService.getApplicationsByUser(userId);

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching user applications:', error);
        return NextResponse.json(
            {error: 'Failed to fetch applications'},
            {status: 500}
        );
    }
}