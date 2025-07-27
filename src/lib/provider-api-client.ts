import { getProviderTokenSafe } from "./get-provider-token"
import type { ProviderName } from "./provider-token-types"

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
}

export interface ApiResponse<T = any> {
  success: true
  data: T
  status: number
}

export interface ApiError {
  success: false
  error: string
  code: string
  status?: number
}

export async function callProviderApi<T = any>(
  provider: ProviderName,
  url: string,
  options: ApiClientOptions = {},
): Promise<ApiResponse<T> | ApiError> {
  // Get the provider token
  const tokenResult = await getProviderTokenSafe(provider)
  if (!tokenResult.success) {
    return {
      success: false,
      error: tokenResult.error,
      code: tokenResult.code,
    }
  }

  const { accessToken } = tokenResult

  try {
    // Build URL with query parameters if provided
    const apiUrl = new URL(url)
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        // Convert all values to strings for URL parameters
        apiUrl.searchParams.append(key, String(value))
      })
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }

    // Add body for non-GET requests
    if (options.body && options.method !== "GET") {
      requestOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body)
    }

    const response = await fetch(apiUrl.toString(), requestOptions)

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.statusText}`,
        code: "API_ERROR",
        status: response.status,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
      status: response.status,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      code: "NETWORK_ERROR",
    }
  }
}

// Convenience functions for common providers
export const googleApi = {
  gmail: {
    getMessages: (params?: { maxResults?: number; q?: string }) =>
      callProviderApi("google", "https://gmail.googleapis.com/gmail/v1/users/me/messages", { params }),

    getMessage: (messageId: string) =>
      callProviderApi("google", `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`),
  },

  calendar: {
    getEvents: (params?: { maxResults?: number; timeMin?: string; timeMax?: string }) =>
      callProviderApi("google", "https://www.googleapis.com/calendar/v3/calendars/primary/events", { params }),
  },
}

export const spotifyApi = {
  getCurrentTrack: () => callProviderApi("spotify", "https://api.spotify.com/v1/me/player/currently-playing"),

  getPlaylists: (params?: { limit?: number; offset?: number }) =>
    callProviderApi("spotify", "https://api.spotify.com/v1/me/playlists", { params }),
}

export const githubApi = {
  getRepos: (params?: { sort?: string; direction?: string; per_page?: number }) =>
    callProviderApi("github", "https://api.github.com/user/repos", { params }),

  getUser: () => callProviderApi("github", "https://api.github.com/user"),
}
