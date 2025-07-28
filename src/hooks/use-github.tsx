"use client"

import { useState, useEffect } from "react"
import { githubApi } from "@/lib/provider-api-client"

export interface Repo {
  name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  updated_at: string
}

export function useGithub() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepos = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await githubApi.getRepos({
        sort: "updated",
        direction: "desc",
        per_page: 50,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      const publicRepos: Repo[] = result.data
        .map((repo: any) => ({
          name: repo.name,
          description: repo.description || "No description available",
          html_url: repo.html_url,
          language: repo.language || "Unknown",
          stargazers_count: repo.stargazers_count,
          updated_at: repo.updated_at,
        }))

      setRepos(publicRepos)
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
