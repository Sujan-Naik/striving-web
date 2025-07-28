"use client"

import { useState, useEffect } from "react"
import { githubApi } from "@/lib/provider-api-client"

export interface ProjectV2 {
  id: string
  title: string
  shortDescription: string | null
  url: string
  public: boolean
  closed: boolean
  createdAt: string
  updatedAt: string
  owner: {
    login: string
    avatarUrl: string
  }
  itemsCount: number
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
      const result = await githubApi.getProjectsV2(50)

      console.log("GitHub API result:", result)

      if (!result.success) {
        console.error("API call failed:", result.error)
        setError(`API Error: ${result.error}`)
        return
      }

      console.log("Raw GraphQL response:", JSON.stringify(result.data, null, 2))

      if (result.data.errors) {
        console.error("GraphQL errors:", result.data.errors)
        setError(`GraphQL Error: ${result.data.errors[0]?.message || "Unknown GraphQL error"}`)
        return
      }

      const projectsData = result.data.data?.viewer?.projectsV2?.nodes || []
      console.log("Projects data:", projectsData)

      const projects: ProjectV2[] = projectsData.map((project: any) => ({
        id: project.id,
        title: project.title,
        shortDescription: project.shortDescription,
        url: project.url,
        public: project.public,
        closed: project.closed,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        owner: {
          login: project.owner?.login || "Unknown",
          avatarUrl: project.owner?.avatarUrl || "",
        },
        itemsCount: 0, // Set to 0 since we're not fetching items for now
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
