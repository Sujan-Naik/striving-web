import { getProviderTokenSafe } from "./get-provider-token"
import type { ProviderName } from "./provider-token-types"
import {DateTime} from "@auth/core/providers/kakao";

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
          // Corrected line: removed the backtick
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

export const bedrockApi = {

}

// GraphQL helper for GitHub
export async function callGitHubGraphQL(query: string, variables?: Record<string, any>) {
  console.log("Making GraphQL request:", { query, variables })

  const result = await callProviderApi("github", "https://api.github.com/graphql", {
    method: "POST",
    body: {
      query,
      variables,
    },
  })

  console.log("GraphQL response:", result)
  return result
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

    createEvent: (params? : {
      calendarId?: string,
      summary?: string,
      start?: {
        date?: Date,
        dateTime?: Date,
        timeZone?: string
      },
      end?: {
        date?: Date,
        dateTime?: Date,
        timeZone?: string
      }
    }) => {
      if (!params?.calendarId) {
        throw new Error("calendarId is required");
      }

      // Construct the API parameters
      const apiParams: Record<string, any> = {
        summary: params?.summary,
        start: {},
        end: {},
      };

      // Handle start
      if (params?.start) {
        if (params.start.date) {
          apiParams.start.date = params.start.date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        } else if (params.start.dateTime) {
          apiParams.start.dateTime = params.start.dateTime.toISOString(); // ISO string
        }
        if (params.start.timeZone) {
          apiParams.start.timeZone = params.start.timeZone;
        }
      }

      // Handle end
      if (params?.end) {
        if (params.end.date) {
          apiParams.end.date = params.end.date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        } else if (params.end.dateTime) {
          apiParams.end.dateTime = params.end.dateTime.toISOString(); // ISO string
        }
        if (params.end.timeZone) {
          apiParams.end.timeZone = params.end.timeZone;
        }
      }

      // Call the API with the constructed parameters
      return callProviderApi("google", `https://www.googleapis.com/calendar/v3/calendars/${params.calendarId}/events`, {
        method: "POST",
        body: JSON.stringify(apiParams)
      });
    },
    deleteEvent: (params?: {
      eventId: string,
      calendarId: string
    })=> {

      if (!params?.calendarId) {
        throw new Error("calendarId is required");
      }

      if (!params?.eventId) {
        throw new Error("eventId is required");
      }
      return callProviderApi("google", `https://www.googleapis.com/calendar/v3/calendars/${params.calendarId}/events/${params.eventId}`, {
        method: "DELETE",
      });
    },

    getCalendars: () => callProviderApi("google", "https://www.googleapis.com/calendar/v3/users/me/calendarList"),

    createCalendar: (params: {
      summary: string,
      description?: string
    }) => {
      if (!params?.summary) {
        throw new Error("summary is required");
      }

      return callProviderApi("google", "https://www.googleapis.com/calendar/v3/calendars", {
        method: "POST",
        body: JSON.stringify({
          summary: params.summary,
          description: params.description
        })
      });
    },

  },
}

export const githubApi = {
    getRepos: (owner: string, params?: { sort?: string; direction?: string; per_page?: number, type?: string }) => {
    const apiParams: Record<string, string | number | boolean> = {}

    if (params?.sort) apiParams.sort = params.sort
    if (params?.direction) apiParams.direction = params.direction
    if (params?.per_page) apiParams.per_page = params.per_page
    if (params?.type) apiParams.type = params.type
    return callProviderApi("github", `https://api.github.com/users/${owner}/repos`, { params: apiParams })
  },

  getAuthUserRepos: (params?: { sort?: string; direction?: string; per_page?: number, type?: string }) => {
    const apiParams: Record<string, string | number | boolean> = {}

    if (params?.sort) apiParams.sort = params.sort
    if (params?.direction) apiParams.direction = params.direction
    if (params?.per_page) apiParams.per_page = params.per_page
    if (params?.type) apiParams.type = params.type
    return callProviderApi("github", `https://api.github.com/user/repos`, { params: apiParams })
  },

  getRepo: (owner: string, repo: string) => {
  return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}`)
  },

  getAuthOwner: () => {
    return callProviderApi("github", "https://api.github.com/user")
  },

  createRepo: (data: {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
  }) => {
    return callProviderApi("github", "https://api.github.com/user/repos", {
      method: "POST",
      body: data
    })
  },

   // Get repository contents
  getContents: (owner: string, repo: string, path: string = '', ref?: string) => {
    const params: Record<string, string> = {};
    if (ref) params.ref = ref;

    return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      params
    });
  },

  // Get file content (decoded)
  getFile: async (owner: string, repo: string, path: string, ref?: string) => {
    const response = await githubApi.getContents(owner, repo, path, ref);
    if (response.success && response.data.content) {
      return {
        ...response,
        data: {
          ...response.data,
          decodedContent: atob(response.data.content.replace(/\n/g, ''))
        }
      };
    }
    return response;
  },

  // Create or update file
  updateFile: (owner: string, repo: string, path: string, data: {
    message: string;
    content: string; // base64 encoded
    sha?: string; // required for updates
    branch?: string;
  }) => {
    return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: data
    });
  },

  // Delete file
  deleteFile: (owner: string, repo: string, path: string, data: {
    message: string;
    sha: string;
    branch?: string;
  }) => {
    return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "DELETE",
      body: data
    });
  },

  // Get branches
  getBranches: (owner: string, repo: string) => {
    return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}/branches`);
  },

  // Create branch
  createBranch: (owner: string, repo: string, data: {
    ref: string; // refs/heads/branch-name
    sha: string; // commit SHA to branch from
  }) => {
    return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      body: data
    });
  },

  // Get commits
  getCommits: (owner: string, repo: string, params?: {
    sha?: string; // branch/commit
    path?: string;
    per_page?: number;
  }) => {
    return callProviderApi("github", `https://api.github.com/repos/${owner}/${repo}/commits`, {
      params
    });
  },

  getProjectsV2: async (first = 20) => {
    const query = `
      query GetUserProjects($first: Int!) {
        viewer {
          id
          projectsV2(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              id
              title
              shortDescription
              url
              public
              closed
              createdAt
              updatedAt
              owner {
                ... on User {
                  login
                  avatarUrl
                }
                ... on Organization {
                  login
                  avatarUrl
                }
              }
            }
          }
        }
      }
    `

    return callGitHubGraphQL(query, { first })
  },

  getProjectV2ById: async (projectId: string) => {
    const query = `
query GetProjectById($id: ID!) {
  node(id: $id) {
    ... on ProjectV2 {
      id
      title
      shortDescription
      readme
      url
      public
      closed
      createdAt
      updatedAt
      owner {
        ... on User {
          login
          avatarUrl
        }
        ... on Organization {
          login
          avatarUrl
        }
      }
      fields(first: 20) { # Fetch project fields
        nodes {
          ... on ProjectV2Field {
            id
            name
          }
          ... on ProjectV2IterationField {
            id
            name
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            options {
              id
              name
            }
          }
        }
      }
      items(first: 50) { # Fetch more items for the kanban board
        nodes {
          id
          fieldValues(first: 100) { # Fetch all field values
            nodes {
              ... on ProjectV2ItemFieldTextValue {
                field {
                  ... on ProjectV2Field {
                    name
                  }
                  ... on ProjectV2IterationField {
                    name
                  }
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
                text
              }
              ... on ProjectV2ItemFieldSingleSelectValue {
                field {
                  ... on ProjectV2Field {
                    name
                  }
                  ... on ProjectV2IterationField {
                    name
                  }
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
                name # The selected option's name
              }
              ... on ProjectV2ItemFieldDateValue {
                field {
                  ... on ProjectV2Field {
                    name
                  }
                  ... on ProjectV2IterationField {
                    name
                  }
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
                date
              }
              ... on ProjectV2ItemFieldIterationValue {
                field {
                  ... on ProjectV2Field {
                    name
                  }
                  ... on ProjectV2IterationField {
                    name
                  }
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
                title
              }
              # Add other field types as needed
            }
          }
          content {
            ... on Issue {
              title
              url
              state
              number
              labels(first: 5) {
                nodes {
                  name
                }
              }
            }
            ... on PullRequest {
              title
              url
              state
              number
              labels(first: 5) {
                nodes {
                  name
                }
              }
            }
            ... on DraftIssue {
              title
              body
            }
          }
        }
      }
    }
  }
}
`
    return callGitHubGraphQL(query, { id: projectId })
  },

  testGraphQL: async () => {
    const query = `
      query {
        viewer {
          id
          login
          name
        }
      }
    `

    return callGitHubGraphQL(query)
  },

  createProjectV2: async (title: string) => {
    // First get the user's ID
    const userQuery = `
      query {
        viewer {
          id
        }
      }
    `

    const userResult = await callGitHubGraphQL(userQuery)

    if (!userResult.success || userResult.data.errors) {
      return {
        success: false,
        error: "Failed to get user ID",
        code: "USER_ID_ERROR",
      }
    }

    const ownerId = userResult.data.data?.viewer?.id

    if (!ownerId) {
      return {
        success: false,
        error: "Could not retrieve user ID",
        code: "USER_ID_ERROR",
      }
    }

    const mutation = `
      mutation CreateProjectV2($input: CreateProjectV2Input!) {
        createProjectV2(input: $input) {
          projectV2 {
            id
            title
            shortDescription
            url
            public
            closed
            createdAt
            updatedAt
          }
        }
      }
    `

    const input = {
      title,
      ownerId,
    }

    return callGitHubGraphQL(mutation, { input })
  },

  createDraftIssue: async (projectId: string, title: string, body?: string) => {
    const mutation = `
      mutation AddProjectV2DraftIssue($input: AddProjectV2DraftIssueInput!) {
        addProjectV2DraftIssue(input: $input) {
          clientMutationId # Request only clientMutationId
        }
      }
    `
    const input = {
      projectId,
      title,
      body,
    }
    const result = await callGitHubGraphQL(mutation, { input })
    console.log("Raw GraphQL response for createDraftIssue:", JSON.stringify(result, null, 2)) // Added logging

    if (!result.success) {
      console.error("API call failed for createDraftIssue:", result.error) // Added logging
      return { success: false, error: result.error, code: result.code }
    }

    if (result.data.errors) {
      console.error("GraphQL errors for createDraftIssue:", JSON.stringify(result.data.errors, null, 2)) // Added logging
      return {
        success: false,
        error: result.data.errors[0]?.message || "Failed to create item due to GraphQL error",
        code: "GRAPHQL_ERROR",
      }
    }

    // If no errors, assume success. The revalidatePath will handle UI update.
    return { success: true, data: result.data, status: result.status }
  },

  getUser: () => callProviderApi("github", "https://api.github.com/user"),

  updateProjectV2ItemFieldValue: async (
    projectId: string,
    itemId: string,
    fieldId: string,
    value: { text?: string; singleSelectOptionId?: string; date?: string; iterationId?: string },
  ) => {
    const mutation = `
    mutation UpdateProjectV2ItemFieldValue($input: UpdateProjectV2ItemFieldValueInput!) {
      updateProjectV2ItemFieldValue(input: $input) {
        clientMutationId
      }
    }
  `
    const input = {
      projectId,
      itemId,
      fieldId,
      value: {
        ...value,
      },
    }
    const result = await callGitHubGraphQL(mutation, { input })
    console.log("Raw GraphQL response for updateProjectV2ItemFieldValue:", JSON.stringify(result, null, 2))

    if (!result.success) {
      console.error("API call failed for updateProjectV2ItemFieldValue:", result.error)
      return { success: false, error: result.error, code: result.code }
    }

    if (result.data.errors) {
      console.error("GraphQL errors for updateProjectV2ItemFieldValue:", JSON.stringify(result.data.errors, null, 2))
      return {
        success: false,
        error: result.data.errors[0]?.message || "Failed to update item field due to GraphQL error",
        code: "GRAPHQL_ERROR",
      }
    }

    return { success: true, data: result.data, status: result.status }
  },
}
