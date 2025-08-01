

import { githubApi } from "@/lib/provider-api-client"
import { Github, List } from "lucide-react"
import Link from "next/link"
import { CreateProjectItem } from "@/components/github/create-project-item"
import { revalidatePath } from "next/cache"
import { ErrorDisplay } from "@/components/project/ErrorDisplay"
import { ProjectContent } from "@/components/project/ProjectContent"
import styles from "@/styles/project.module.css"
import type { ProjectV2, ProjectV2Item } from "@/hooks/use-github-projects"

interface ProjectPageProps {
  params: { projectId: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const result = await githubApi.getProjectV2ById(projectId)

  async function revalidateProjectPage() {
    "use server"
    revalidatePath(`/github/projects/[project-id]`)
  }

  if (!result.success) {
    return <ErrorDisplay title="Error Loading Project" message={result.error} iconColor="text-red-500" />
  }

  if (result.data.errors) {
    return <ErrorDisplay 
      title="GraphQL Error" 
      message={result.data.errors[0]?.message || "Unknown GraphQL error"} 
      iconColor="text-red-500" 
    />
  }

  const project: ProjectV2 | null = result.data.data?.node

  if (!project) {
    return <ErrorDisplay 
      title="Project Not Found" 
      message={`The project with ID "${projectId}" could not be found.`} 
      iconColor="text-orange-500" 
    />
  }

  // Status field logic
  const statusField = project.fields?.nodes?.find(
    (field) => (field.name.toLowerCase() === "status" || field.name.toLowerCase() === "state") && field.options
  )
  const statusOptions = statusField?.options || []
  const statusFieldId = statusField?.id || null

  // Process items by status
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
          <CreateProjectItem projectId={projectId} onItemCreated={revalidateProjectPage} />
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
        revalidateProjectPage={revalidateProjectPage}
      />
    </div>
  )
}