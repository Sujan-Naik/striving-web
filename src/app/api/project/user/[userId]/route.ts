import {NextRequest, NextResponse} from 'next/server';
import userService from '@/services/userService';
import dbConnect from "@/lib/mongodb";

export async function GET(request: NextRequest, {params}: { params: Promise<{ userId: string }> }) {
    try {
        await dbConnect();
        const {userId} = await params;
        const user = await userService.findById(userId);
        if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch user'}, {status: 500});
    }
}

export async function PUT(request: NextRequest, {params}: { params: Promise<{ userId: string }> }) {
    try {
        await dbConnect()
        const updates = await request.json();
        const {userId} = await params
        const user = await userService.updateUser(userId, updates);
        if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({error: 'Failed to update user'}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, {params}: { params: Promise<{ userId: string }> }) {
    try {
        await dbConnect()
        const {userId} = await params;
        const user = await userService.deleteUser(userId);
        if (!user) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }
        return NextResponse.json({message: 'User deleted successfully'});
    } catch (error) {
        return NextResponse.json({error: 'Failed to delete user'}, {status: 500});
    }
}