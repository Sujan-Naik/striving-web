import {NextRequest, NextResponse} from 'next/server';
import {docsSectionService} from '@/services/docsSectionService';


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ featureId: string }> }
) {
    const {featureId} = await params;

    const sections = await docsSectionService.findByFeature(featureId);
    return NextResponse.json(sections);
}
