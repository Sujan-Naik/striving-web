import { db } from "./db"
import { account } from "./schema"
import { eq } from "drizzle-orm"

export async function getUserAccounts(userId: string) {
  const userAccounts = await db
    .select({
      provider: account.provider,
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      expiresAt: account.expires_at,
    })
    .from(account)
    .where(eq(account.userId, userId))

  return userAccounts
}
