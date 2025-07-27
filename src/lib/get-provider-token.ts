"use server"

import { auth } from "@/auth"
import { getUserAccounts } from "./accounts"
import { type ProviderName, type ProviderToken, ProviderTokenError } from "./provider-token-types"

// Server Action - can be called from client components
export async function getProviderToken(provider: ProviderName): Promise<ProviderToken> {
  // Check if user is authenticated
  const session = await auth()
  if (!session?.user?.id) {
    throw new ProviderTokenError("User is not authenticated", provider, "NOT_AUTHENTICATED")
  }

  // Get user's connected accounts
  const accounts = await getUserAccounts(session.user.id)

  // Find the specific provider account
  const providerAccount = accounts.find((account) => account.provider === provider)

  if (!providerAccount) {
    throw new ProviderTokenError(`${provider} account is not connected`, provider, "PROVIDER_NOT_CONNECTED")
  }

  if (!providerAccount.accessToken) {
    throw new ProviderTokenError(`No access token found for ${provider}`, provider, "NO_ACCESS_TOKEN")
  }

  return {
    accessToken: providerAccount.accessToken,
    refreshToken: providerAccount.refreshToken,
    expiresAt: providerAccount.expiresAt,
  }
}

// Server Action with error handling for client components
export async function getProviderTokenSafe(
  provider: ProviderName,
): Promise<
  | { success: true; accessToken: string; refreshToken: string | null; expiresAt: number | null }
  | { success: false; error: string; code: string }
> {
  try {
    const token = await getProviderToken(provider)
    return { success: true, ...token }
  } catch (error) {
    if (error instanceof ProviderTokenError) {
      return { success: false, error: error.message, code: error.code }
    }
    return { success: false, error: "Unknown error occurred", code: "UNKNOWN" }
  }
}
