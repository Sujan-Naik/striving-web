import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/schema'
import { ilike, or } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) return Response.json([])

  const users = await db.select()
    .from(user)
    .where(or(
      ilike(user.name, `%${query}%`),
      ilike(user.email, `%${query}%`)
    ))
    .limit(10)

  return Response.json(users)
}