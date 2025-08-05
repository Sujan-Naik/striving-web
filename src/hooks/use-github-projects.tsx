"use client"

import { useState, useEffect } from "react"

// Define more detailed types for ProjectV2 and its items
export interface ProjectV2SingleSelectFieldOption {
  id: string
  name: string
}

export interface ProjectV2Field {
  id: string
  name: string
  options?: ProjectV2SingleSelectFieldOption[] // Only for single-select fields
  // Add other field-specific properties if needed
}

export interface ProjectV2ItemField {
  field: {
    name: string
  }
  text?: string
  name?: string // For single select
  date?: string
  title?: string // For iteration
}

export interface ProjectV2ItemContent {
  title?: string
  url?: string
  state?: string // For Issue/PullRequest
  number?: number // For Issue/PullRequest
  body?: string // For DraftIssue
  labels?: {
    nodes: { name: string }[]
  }
}

export interface ProjectV2Item {
  id: string
  fieldValues: {
    nodes: ProjectV2ItemField[]
  }
  content: ProjectV2ItemContent | null
}

export interface ProjectV2 {
  id: string
  title: string
  shortDescription: string | null
  readme: string | null
  url: string
  public: boolean
  closed: boolean
  createdAt: string
  updatedAt: string
  owner: {
    login: string
    avatarUrl: string
  }
  fields: {
    nodes: ProjectV2Field[]
  } | null // Add fields here
  items: {
    nodes: ProjectV2Item[]
  } | null
}

export function useGithubProjects() {
  const [projects, setProjects] = useState<ProjectV2[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching GitHub projects...")

      const response = await fetch('/api/github/projects')

      if (!response.ok) {
        setError(`HTTP Error: ${response.status} ${response.statusText}`)
        return
      }

      const data = await response.json()
      console.log("GitHub API response:", data)

      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
        setError(`GraphQL Error: ${data.errors[0]?.message || "Unknown GraphQL error"}`)
        return
      }

      const projectsData = data.data?.viewer?.projectsV2?.nodes || []
      console.log("Projects data:", projectsData)

      const projects: ProjectV2[] = projectsData.map((project: any) => ({
        id: project.id,
        title: project.title,
        shortDescription: project.shortDescription,
        readme: project.readme,
        url: project.url,
        public: project.public,
        closed: project.closed,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        owner: {
          login: project.owner?.login || "Unknown",
          avatarUrl: project.owner?.avatarUrl || "",
        },
        fields: project.fields || null,
        items: project.items || null,
      }))

      console.log("Mapped projects:", projects)
      setProjects(projects)
    } catch (err) {
      console.error("Exception in fetchProjects:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return { projects, loading, error, refetch: fetchProjects }
}