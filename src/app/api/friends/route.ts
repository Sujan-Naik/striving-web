import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { friendship } from '@/lib/schema'

export async function POST(request: NextRequest) {
  const { userId, currentUserId } = await request.json()

  const newFriendship = await db.insert(friendship).values({
    requesterId: currentUserId,
    addresseeId: userId,
    status: 'pending'
  }).returning()

  return Response.json(newFriendship[0])
}