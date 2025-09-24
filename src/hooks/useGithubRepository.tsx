"use client"

import { useState, useEffect } from "react"
import {Repository} from "@/types/github";

export function useGithubRepository() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepositories = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/github/repos')

      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const repositories = await response.json()
      setRepos(repositories)
      console.log(repositories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      console.error('Error fetching repositories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepositories()
  }, [])

  return {
    repos,
    loading,
    error,
    refetch: fetchRepositories
  }
}