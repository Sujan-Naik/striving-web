"use client"

import { useState, useEffect } from "react"
import { Repository } from '@/types/github';


export function useGithubRepos() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepos = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get user info first
      const userResponse = await fetch('/api/github/user')
      if (!userResponse.ok) {
        throw new Error(`Failed to get user: ${userResponse.status}`)
      }
      const user = await userResponse.json()

      // Get repos
    const reposResponse = await fetch(`/api/github/repos?type=all&sort=updated&direction=desc&per_page=50`)
      if (!reposResponse.ok) {
        throw new Error(`Failed to fetch repos: ${reposResponse.status}`)
      }

      const reposData = await reposResponse.json()

      const repos: Repository[] = reposData
        .map((repo: any) => ({
          name: repo.name,
          description: repo.description || "No description available",
          html_url: repo.html_url,
          language: repo.language || "Unknown",
          stargazers_count: repo.stargazers_count,
          updated_at: repo.updated_at,
        }))

      setRepos(repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepos()
  }, [])

  return { repos, loading, error, refetch: fetchRepos }
}