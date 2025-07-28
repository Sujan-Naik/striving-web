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
    // Get the account record
    const accounts = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      .limit(1)

    const providerAccount = accounts[0]
    if (!providerAccount) {
      // This case should ideally be caught earlier by getProviderToken
      return { success: false, error: "Provider account not found for user" }
    }
    if (!providerAccount.refresh_token) {
      // If no refresh token, invalidate and return error
      await db
        .update(account)
        .set({ access_token: null, refresh_token: null, expires_at: null })
        .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      return { success: false, error: "No refresh token available for this provider" }
    }

    // Get provider-specific refresh configuration
    const refreshConfig = getRefreshConfig(provider)
    if (!refreshConfig) {
      // If refresh is not supported for this provider, invalidate and return error
      await db
        .update(account)
        .set({ access_token: null, refresh_token: null, expires_at: null })
        .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      return { success: false, error: `Token refresh not supported for ${provider}` }
    }

    // Make refresh request
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
      const errorText = await response.text()
      console.error(`Token refresh failed for ${provider}:`, errorText)
      // Invalidate tokens in DB on refresh failure
      await db
        .update(account)
        .set({ access_token: null, refresh_token: null, expires_at: null })
        .where(and(eq(account.userId, userId), eq(account.provider, provider)))
      return { success: false, error: `Token refresh failed: ${response.statusText}` }
    }

    const tokenData: RefreshTokenResponse = await response.json()

    // Calculate new expiration time
    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in

    // Update the database
    await db
      .update(account)
      .set({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || providerAccount.refresh_token, // Keep old refresh token if new one not provided
        expires_at: expiresAt,
        scope: tokenData.scope || providerAccount.scope,
      })
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))

    return { success: true, accessToken: tokenData.access_token }
  } catch (error) {
    console.error(`Error refreshing ${provider} token:`, error)
    // Invalidate tokens in DB on unexpected errors during refresh
    await db
      .update(account)
      .set({ access_token: null, refresh_token: null, expires_at: null })
      .where(and(eq(account.userId, userId), eq(account.provider, provider)))
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
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
    case "spotify":
      return {
        tokenUrl: "https://accounts.spotify.com/api/token",
        clientId: process.env.AUTH_SPOTIFY_ID!,
        clientSecret: process.env.AUTH_SPOTIFY_SECRET!,
        extraParams: {},
      }
    case "github":
      // GitHub tokens don't expire, but we'll include it for completeness
      // Note: GitHub's token refresh flow is different (no standard refresh token)
      // For GitHub, if the access token is invalid, the user must re-authenticate.
      // We'll treat it as "not supported" for automatic refresh via refresh_token flow.
      return null // Explicitly return null for GitHub as it doesn't use refresh tokens this way
    default:
      return null
  }
}
