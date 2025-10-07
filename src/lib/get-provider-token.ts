"use server"

import {auth} from "@/auth"
import {getUserAccounts} from "./accounts"
import {type ProviderName, type ProviderToken, ProviderTokenError} from "./provider-token-types"
import {refreshProviderToken} from "./token-refresh"
import {isTokenExpired} from "./utils/token"

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

    // If access token is missing (e.g., invalidated by refresh failure)
    if (!providerAccount.accessToken) {
        throw new ProviderTokenError(
            `No valid access token found for ${provider}. Please re-authenticate.`,
            provider,
            "NO_ACCESS_TOKEN",
        )
    }

    // Check if token is expired and refresh if needed
    if (isTokenExpired(providerAccount.expiresAt)) {
        console.log(`Token expired for ${provider}, attempting refresh...`)

        const refreshResult = await refreshProviderToken(session.user.id, provider)

        if (!refreshResult.success) {
            // If refresh failed, the tokens have already been nullified in token-refresh.ts
            throw new ProviderTokenError(
                `Token expired and refresh failed for ${provider}: ${refreshResult.error}. Please re-authenticate.`,
                provider,
                "TOKEN_REFRESH_FAILED",
            )
        }

        // Return the refreshed token
        return {
            accessToken: refreshResult.accessToken,
            refreshToken: providerAccount.refreshToken, // This might be null if the provider doesn't issue new ones
            expiresAt: null, // The actual new expires_at is in the DB, but we don't need to fetch it again here
        }
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
        return {success: true, ...token}
    } catch (error) {
        if (error instanceof ProviderTokenError) {
            // No automatic signOut/redirect here.
            // The client component will handle the error and prompt re-authentication.
            return {success: false, error: error.message, code: error.code}
        }
        return {success: false, error: "Unknown error occurred", code: "UNKNOWN"}
    }
}
