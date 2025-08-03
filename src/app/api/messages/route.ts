import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { message, user } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')!

  const messages = await db.select({
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    createdAt: message.createdAt,
    senderName: user.name
  })
  .from(message)
  .leftJoin(user, eq(message.senderId, user.id))
  .where(eq(message.conversationId, conversationId))
  .orderBy(message.createdAt)

  return Response.json(messages)
}

export async function POST(request: NextRequest) {
  const { conversationId, senderId, content } = await request.json()

  const newMessage = await db.insert(message).values({
    conversationId,
    senderId,
    content
  }).returning()

  return Response.json(newMessage[0])
}