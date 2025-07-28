"use client"

import {useGithubRepos} from "@/hooks/use-github-repos"

import {AlertCircle, Badge, ExternalLink, Github, RefreshCw, Star} from "lucide-react"
import {HeadedButton, HeadedCard, HeadedDialog, VariantEnum} from "headed-ui";
import {useState} from "react";

export function GithubRepos() {
  const { repos, loading, error, refetch } = useGithubRepos()

    const [showDialog, setShowDialog] = useState(false);

  if (error) {
    return (
      <div className="space-y-4">
        <HeadedDialog isOpen={showDialog} onClick={() => setShowDialog(!showDialog)} title={"Error Loading Repos"} variant={VariantEnum.Outline}>
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </HeadedDialog>
        <HeadedButton  variant={VariantEnum.Outline}  onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </HeadedButton>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Github className="h-6 w-6" />
          Public Repositories
        </h2>
          {!loading &&
        <HeadedButton variant={VariantEnum.Outline} onClick={refetch} >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </HeadedButton>
          }
      </div>

      {loading && repos.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading repositories...</span>
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <Github className="h-12 w-12 mx-auto mb-4" />
          <p>No public repositories found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {repos.map((repo) => (
            <HeadedCard variant={VariantEnum.Primary} key={repo.html_url} className="hover:shadow-md transition-shadow">
              <HeadedCard variant={VariantEnum.Secondary}className="pb-3">
                <div className="flex items-start justify-between">
                  <h1 className="text-lg">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-2"
                    >
                      {repo.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h1>
                  <div className="flex items-center gap-2">
                    {repo.stargazers_count > 0 && (
                      <Badge  className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </Badge>
                    )}
                    {repo.language && <Badge>{repo.language}</Badge>}
                  </div>
                </div>
              </HeadedCard>
              <HeadedCard variant={VariantEnum.Tertiary}>
                <p className="text-muted-foreground mb-2">{repo.description}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </p>
              </HeadedCard>
            </HeadedCard>
          ))}
        </div>
      )}
    </div>
  )
}
