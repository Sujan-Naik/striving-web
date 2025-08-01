"use client"

import {useGithubProjects} from "@/hooks/use-github-projects"
import {AlertCircle, Archive, Calendar, ExternalLink, Github, Lock, RefreshCw, Unlock, User} from "lucide-react"
import {HeadedButton, HeadedCard, HeadedDialog, HeadedLink, VariantEnum} from "headed-ui"
import {useState} from "react"
import {CreateGithubProject} from "./create-github-project"

export function GithubProjects() {
  const { projects, loading, error, refetch } = useGithubProjects()
  const [showDialog, setShowDialog] = useState(false)

  if (error) {
    return (
      <div className="space-y-4">
        <HeadedDialog
          isOpen={showDialog}
          onClick={() => setShowDialog(!showDialog)}
          title={"Error Loading Projects"}
          variant={VariantEnum.Outline}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
            <details className="text-xs">
              <summary>Debug Info</summary>
              <p>Check the browser console for detailed error logs.</p>
            </details>
          </div>
        </HeadedDialog>
        <div className="flex gap-2">
          <HeadedButton variant={VariantEnum.Outline} onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </HeadedButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Github className="h-6 w-6" />
          GitHub Projects V2
        </h2>
        <div className="flex items-center gap-2">
          <CreateGithubProject onProjectCreated={refetch} />
          {!loading && (
            <HeadedButton variant={VariantEnum.Outline} onClick={refetch}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </HeadedButton>
          )}
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <Github className="h-12 w-12 mx-auto mb-4" />
          <p>No projects found</p>
          <div className="mt-4">
            <CreateGithubProject onProjectCreated={refetch} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <HeadedCard variant={VariantEnum.Primary} key={project.id} className="hover:shadow-md transition-shadow">
              <HeadedCard variant={VariantEnum.Secondary} className="pb-3">
                <div className="flex items-start justify-between">
                  <h1 className="text-lg">
                    {/* Use Link component for navigation */}
                    <HeadedLink variant={VariantEnum.Secondary} href={`/github/projects/${project.id}`} className="hover:underline flex items-center gap-2">
                      {project.title}
                      <ExternalLink className="h-4 w-4" />
                    </HeadedLink>
                  </h1>
                  <div className="flex items-center gap-2">
                    {project.closed ? (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        Closed
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Open</span>
                    )}
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                      {project.public ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {project.public ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              </HeadedCard>
              <HeadedCard variant={VariantEnum.Tertiary}>
                <p className="text-muted-foreground mb-2">{project.shortDescription || "No description available"}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {project.owner.login}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </HeadedCard>
            </HeadedCard>
          ))}
        </div>
      )}
    </div>
  )
}
