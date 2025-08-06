export type ProviderName = "google" | "github"

export interface ProviderToken {
  accessToken: string
  refreshToken: string | null
  expiresAt: number | null
}

export class ProviderTokenError extends Error {
  constructor(
    message: string,
    public provider: ProviderName,
    public code: "NOT_AUTHENTICATED" | "PROVIDER_NOT_CONNECTED" | "NO_ACCESS_TOKEN" | "TOKEN_REFRESH_FAILED",
  ) {
    super(message)
    this.name = "ProviderTokenError"
  }
}
