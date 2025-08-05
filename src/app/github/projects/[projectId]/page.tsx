'use client'
import { Github, List } from "lucide-react"
import Link from "next/link"
import { CreateProjectItem } from "@/components/github/create-project-item"
import { ErrorDisplay } from "@/components/project/ErrorDisplay"
import { ProjectContent } from "@/components/project/ProjectContent"
import styles from "@/styles/project.module.css"
import type { ProjectV2Item } from "@/hooks/use-github-projects"
import { useProject } from "@/hooks/use-github-project"
import { useEffect, useState } from "react"

interface ProjectPageProps {
  params: { projectId: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [projectId, setProjectId] = useState<string | null>(null)
  const { project, loading, error, refetchProject } = useProject(projectId)

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params
      setProjectId(resolvedParams.projectId)
    }
    resolveParams()
  }, [params])

  if (loading) return <div>Loading...</div>
  if (error) return <ErrorDisplay title="Error" message={error} iconColor="text-red-500" />
  if (!project || !projectId) return <ErrorDisplay title="Project Not Found" message="Project not found" iconColor="text-orange-500" />

  const statusField = project.fields?.nodes?.find(
    (field) => (field.name.toLowerCase() === "status" || field.name.toLowerCase() === "state") && field.options
  )
  const statusOptions = statusField?.options || []
  const statusFieldId = statusField?.id || null

  const itemsByStatus: Record<string, ProjectV2Item[]> = {}
  const defaultStatus = "No Status"

  project.items?.nodes?.forEach((item) => {
    const statusField = item.fieldValues?.nodes?.find(
      (field) =>
        (field.field?.name?.toLowerCase() === "status" || field.field?.name?.toLowerCase() === "state") &&
        typeof field.name === "string"
    )
    const status = statusField?.name || defaultStatus
    if (!itemsByStatus[status]) itemsByStatus[status] = []
    itemsByStatus[status].push(item)
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Github className="h-8 w-8" />
          {project.title}
        </h1>
        <div className={styles.headerActions}>
          <CreateProjectItem projectId={projectId} onItemCreated={refetchProject} />
          <Link href="/github/projects" className={styles.backLink}>
            <List className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>

      <ProjectContent
        project={project}
        projectId={projectId}
        itemsByStatus={itemsByStatus}
        statusFieldId={statusFieldId}
        statusOptions={statusOptions}
        revalidateProjectPage={refetchProject}
      />
    </div>
  )
}