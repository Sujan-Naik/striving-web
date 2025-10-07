import {getProviderTokenSafe} from "./get-provider-token"
import type {ProviderName} from "./provider-token-types"

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

    const {accessToken} = tokenResult

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

export const githubApi = {
    getRepos: (owner: string, params?: { sort?: string; direction?: string; per_page?: number, type?: string }) => {
        const apiParams: Record<string, string | number | boolean> = {}

        if (params?.sort) apiParams.sort = params.sort
        if (params?.direction) apiParams.direction = params.direction
        if (params?.per_page) apiParams.per_page = params.per_page
        if (params?.type) apiParams.type = params.type
        return callProviderApi("github", `https://api.github.com/users/${owner}/repos`, {params: apiParams})
    },

    getAuthUserRepos: (params?: { sort?: string; direction?: string; per_page?: number, type?: string }) => {
        const apiParams: Record<string, string | number | boolean> = {}

        if (params?.sort) apiParams.sort = params.sort
        if (params?.direction) apiParams.direction = params.direction
        if (params?.per_page) apiParams.per_page = params.per_page
        if (params?.type) apiParams.type = params.type
        return callProviderApi("github", `https://api.github.com/user/repos`, {params: apiParams})
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
}
