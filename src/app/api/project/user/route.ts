import User from '@/models/User'
import dbConnect from '@/lib/mongodb'
import {NextRequest, NextResponse} from "next/server";
import userService from "@/services/userService";

export async function GET() {
    try {
        await dbConnect()
        const users = await User.find({})
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({error: 'Failed to fetch users'}, {status: 500})
    }
}


export async function POST(request: NextRequest) {
    await dbConnect()

    try {
        const body = await request.json()

        // Validate input
        if (!body?.name || !body?.email) {
            return NextResponse.json({error: 'Missing required fields'}, {status: 400})
        }

        const result = await userService.createUser({
            username: body.name,
            githubId: body.name,
            email: body.email,
            avatarUrl: body.avatarUrl,
        })

        if (result) {
            return NextResponse.json({message: 'User created successfully'}, {status: 201})
        } else {
            return NextResponse.json({error: 'Failed to create user'}, {status: 500})
        }
    } catch (e) {
        console.error('Error in POST /api/project/user:', e)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}