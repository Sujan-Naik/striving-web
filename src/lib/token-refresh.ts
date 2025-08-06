"use server"

import { db } from "./db"
import { account } from "./schema"
import { eq, and } from "drizzle-orm"
import type { ProviderName } from "./provider-token-types"

interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type?: string
  scope?: string
}

export async function refreshProviderToken(
  userId: string,
  provider: ProviderName,
): Promise<{ success: true; accessToken: string } | { success: false; error: string }> {
  try {
    const accounts = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      .limit(1)

    const providerAccount = accounts[0]
    if (!providerAccount) {
      return { success: false, error: "Provider account not found for user" }
    }

    if (!providerAccount.refresh_token) {
      await invalidateTokens(userId, provider)
      return { success: false, error: "No refresh token available for this provider" }
    }

    const refreshConfig = getRefreshConfig(provider)
    if (!refreshConfig) {
      await invalidateTokens(userId, provider)
      return { success: false, error: `Token refresh not supported for ${provider}` }
    }

    const response = await fetch(refreshConfig.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${refreshConfig.clientId}:${refreshConfig.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: providerAccount.refresh_token,
        ...refreshConfig.extraParams,
      }),
    })

    if (!response.ok) {
      console.error(`Token refresh failed for ${provider}:`, await response.text())
      await invalidateTokens(userId, provider)
      return { success: false, error: `Token refresh failed: ${response.statusText}` }
    }

    const tokenData: RefreshTokenResponse = await response.json()
    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in

    await db
      .update(account)
      .set({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || providerAccount.refresh_token,
        expires_at: expiresAt,
        scope: tokenData.scope || providerAccount.scope,
      })
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))

    return { success: true, accessToken: tokenData.access_token }
  } catch (error) {
    console.error(`Error refreshing ${provider} token:`, error)
    await invalidateTokens(userId, provider)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function invalidateTokens(userId: string, provider: ProviderName) {
  await db
    .update(account)
    .set({ access_token: null, refresh_token: null, expires_at: null })
    .where(and(eq(account.userId, userId), eq(account.provider, provider)))
}

function getRefreshConfig(provider: ProviderName) {
  switch (provider) {
    case "google":
      return {
        tokenUrl: "https://oauth2.googleapis.com/token",
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        extraParams: {},
      }
    case "github":
      return null
    default:
      return null
  }
}