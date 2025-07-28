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
    const apiUrl = new URL(url)
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          apiUrl.searchParams.append(key, String(value))
        }
      })
    }

    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }

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

    // Handle empty responses (like Spotify play/pause endpoints)
    let data
    const contentType = response.headers.get("content-type")
    if (response.status === 204 || !contentType?.includes("application/json")) {
      data = null // No content or not JSON
    } else {
      const text = await response.text()
      data = text ? JSON.parse(text) : null
    }

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

// Enhanced Google API functions
export const googleApi = {
  gmail: {
    getMessages: (params?: { maxResults?: number; q?: string; labelIds?: string[] }) => {
      const apiParams: Record<string, string | number | boolean> = {}

      if (params?.maxResults) apiParams.maxResults = params.maxResults
      if (params?.q) apiParams.q = params.q
      if (params?.labelIds) apiParams.labelIds = params.labelIds.join(",")

      return callProviderApi("google", "https://gmail.googleapis.com/gmail/v1/users/me/messages", {
        params: apiParams,
      })
    },

    getMessage: (messageId: string, format: "full" | "metadata" | "minimal" = "full") =>
      callProviderApi("google", `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        params: { format },
      }),

    getProfile: () => callProviderApi("google", "https://gmail.googleapis.com/gmail/v1/users/me/profile"),

    getLabels: () => callProviderApi("google", "https://gmail.googleapis.com/gmail/v1/users/me/labels"),
  },

  calendar: {
    getEvents: (params?: {
      maxResults?: number
      timeMin?: string
      timeMax?: string
      singleEvents?: boolean
      orderBy?: "startTime" | "updated"
      calendarId?: string
    }) => {
      const apiParams: Record<string, string | number | boolean> = {}

      if (params?.maxResults) apiParams.maxResults = params.maxResults
      if (params?.timeMin) apiParams.timeMin = params.timeMin
      if (params?.timeMax) apiParams.timeMax = params.timeMax
      if (params?.singleEvents !== undefined) apiParams.singleEvents = params.singleEvents
      if (params?.orderBy) apiParams.orderBy = params.orderBy

      return callProviderApi(
        "google",
        `https://www.googleapis.com/calendar/v3/calendars/${params?.calendarId || "primary"}/events`,
        { params: apiParams },
      )
    },

    getCalendars: () => callProviderApi("google", "https://www.googleapis.com/calendar/v3/users/me/calendarList"),
  },
}

export const spotifyApi = {
  getCurrentPlayback: () => callProviderApi("spotify", "https://api.spotify.com/v1/me/player"),

  play: () =>
    callProviderApi("spotify", "https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
    }),

  pause: () =>
    callProviderApi("spotify", "https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
    }),

  next: () =>
    callProviderApi("spotify", "https://api.spotify.com/v1/me/player/next", {
      method: "POST",
    }),

  previous: () =>
    callProviderApi("spotify", "https://api.spotify.com/v1/me/player/previous", {
      method: "POST",
    }),

  getCurrentTrack: () => callProviderApi("spotify", "https://api.spotify.com/v1/me/player/currently-playing"),

  getPlaylists: (params?: { limit?: number; offset?: number }) => {
    const apiParams: Record<string, string | number | boolean> = {}

    if (params?.limit) apiParams.limit = params.limit
    if (params?.offset) apiParams.offset = params.offset

    return callProviderApi("spotify", "https://api.spotify.com/v1/me/playlists", { params: apiParams })
  },
}

export const githubApi = {
  getRepos: (params?: { sort?: string; direction?: string; per_page?: number }) => {
    const apiParams: Record<string, string | number | boolean> = {}

    if (params?.sort) apiParams.sort = params.sort
    if (params?.direction) apiParams.direction = params.direction
    if (params?.per_page) apiParams.per_page = params.per_page

    return callProviderApi("github", "https://api.github.com/user/repos", { params: apiParams })
  },

  getUser: () => callProviderApi("github", "https://api.github.com/user"),
}
