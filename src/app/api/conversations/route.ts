import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { conversation, user, message } from '@/lib/schema'
import { eq, or, and, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')!

  const conversations = await db.select({
    id: conversation.id,
    otherUser: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image
    },
    lastMessage: {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt
    }
  })
  .from(conversation)
  .leftJoin(user, or(
    and(eq(conversation.user1Id, userId), eq(user.id, conversation.user2Id)),
    and(eq(conversation.user2Id, userId), eq(user.id, conversation.user1Id))
  ))
  .leftJoin(message, eq(message.conversationId, conversation.id))
  .where(or(eq(conversation.user1Id, userId), eq(conversation.user2Id, userId)))
  .orderBy(desc(message.createdAt))

  return Response.json(conversations)
}

export async function POST(request: NextRequest) {
  const { userId, currentUserId } = await request.json()

    const existing = await db.select().from(conversation)
      .where(or(
        and(eq(conversation.user1Id, currentUserId), eq(conversation.user2Id, userId)),
        and(eq(conversation.user1Id, userId), eq(conversation.user2Id, currentUserId))
      ))

    if (existing.length > 0) {
      return Response.json(existing[0])
    }

  const newConversation = await db.insert(conversation).values({
    user1Id: currentUserId,
    user2Id: userId
  }).returning()

  return Response.json(newConversation[0])
}