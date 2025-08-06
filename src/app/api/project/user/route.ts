import User from '@/models/User'
import dbConnect from '@/lib/mongodb'
import {NextRequest, NextResponse} from "next/server";

export async function GET() {
  try {
    await dbConnect()
    const users = await User.find({})
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    const user = await User.create(body)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}