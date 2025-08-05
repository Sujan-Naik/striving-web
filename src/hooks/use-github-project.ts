'use client'
import { useState, useCallback, useEffect } from 'react'
import type { ProjectV2 } from "@/hooks/use-github-projects"

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<ProjectV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/github/projects/${projectId}`)
      const result = await response.json()

      if (result.data.errors) {
        setError(result.data.errors[0]?.message || "Unknown GraphQL error")
        return
      }

      const projectData = result.data.node
      if (!projectData) {
        setError(`Project with ID "${projectId}" not found`)
        return
      }

      setProject(projectData)
      setError(null)
    } catch (err) {
      setError("Failed to fetch project")
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }, [projectId])

  const refetchProject = useCallback(async () => {
    setIsRefetching(true)
    await fetchProject()
  }, [fetchProject])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    refetchProject,
    isRefetching
  }
}