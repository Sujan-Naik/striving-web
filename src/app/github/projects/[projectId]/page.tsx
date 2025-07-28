import { githubApi } from "@/lib/provider-api-client"
import { HeadedCard, VariantEnum } from "headed-ui" // Reverted to HeadedCard
import { ExternalLink, Github, User, Calendar, Lock, Unlock, Archive, List, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import { KanbanBoard } from "@/components/github/kanban-board"
import { CreateProjectItem } from "@/components/github/create-project-item" // Fixed import syntax
import { revalidatePath } from "next/cache"
import type { ProjectV2Item, ProjectV2 } from "@/hooks/use-github-projects"

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params

  const result = await githubApi.getProjectV2ById(projectId)

  if (!result.success) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Error Loading Project</h1>
        <p className="text-muted-foreground">{result.error}</p>
        <Link href="/github/projects" className="text-blue-500 hover:underline">
          Back to Projects
        </Link>
      </div>
    )
  }

  if (result.data.errors) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">GraphQL Error</h1>
        <p className="text-muted-foreground">{result.data.errors[0]?.message || "Unknown GraphQL error"}</p>
        <Link href="/github/projects" className="text-blue-500 hover:underline">
          Back to Projects
        </Link>
      </div>
    )
  }

  const project: ProjectV2 | null = result.data.data?.node

  if (!project) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground">The project with ID "{projectId}" could not be found.</p>
        <Link href="/github/projects" className="text-blue-500 hover:underline">
          Back to Projects
        </Link>
      </div>
    )
  }

  // Find the status field and its options
  const statusField = project.fields?.nodes?.find(
    (field) => (field.name.toLowerCase() === "status" || field.name.toLowerCase() === "state") && field.options, // Ensure it's a single-select field with options
  )

  const statusOptions = statusField?.options || []
  const statusFieldId = statusField?.id || null

  // Process items for Kanban board
  const itemsByStatus: Record<string, ProjectV2Item[]> = {}
  const defaultStatus = "No Status" // Default column if status field isn't found or is empty

  project.items?.nodes?.forEach((item) => {
    // Look for a field named "Status" or "State" that is a single-select value
    const statusField = item.fieldValues?.nodes?.find(
      (field) =>
        (field.field?.name?.toLowerCase() === "status" || field.field?.name?.toLowerCase() === "state") &&
        typeof field.name === "string", // Check if it's a single-select value
    )

    const status = statusField?.name || defaultStatus

    if (!itemsByStatus[status]) {
      itemsByStatus[status] = []
    }
    itemsByStatus[status].push(item)
  })

  // Server Action to revalidate the path after an item is created
  async function revalidateProjectPage() {
    "use server"
      revalidatePath(`/github/projects/[project-id]`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Github className="h-8 w-8" />
          {project.title}
        </h1>
        <div className="flex items-center gap-2">
          <CreateProjectItem
            projectId={projectId}
            onItemCreated={revalidateProjectPage}
          />
          <Link href="/github/projects" className="text-blue-500 hover:underline flex items-center gap-1">
            <List className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>

      <HeadedCard variant={VariantEnum.Primary} className="p-6 space-y-4">
        {" "}
        {/* Reverted to HeadedCard */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {project.owner?.login || "Unknown Owner"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Updated {new Date(project.updatedAt).toLocaleDateString()}
          </div>
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
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            View on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        {project.shortDescription && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{project.shortDescription}</p>
          </div>
        )}
        {project.readme && (
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              README
            </h2>
            <HeadedCard variant={VariantEnum.Secondary} className="p-4 bg-gray-50 border rounded-md">
              {" "}
              {/* Reverted to HeadedCard */}
              <pre className="whitespace-pre-wrap font-mono text-sm">{project.readme}</pre>
            </HeadedCard>
          </div>
        )}
        {/* Kanban Board Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <List className="h-5 w-5" />
            Kanban Board
          </h2>
          {Object.keys(itemsByStatus).length === 0 && project.items?.nodes?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>No items found for this project.</p>
            </div>
          ) : (
            <KanbanBoard
              projectId={projectId}
              itemsByStatus={itemsByStatus}
              statusFieldId={statusFieldId}
              statusOptions={statusOptions}
              onItemUpdated={revalidateProjectPage}
            />
          )}
        </div>
      </HeadedCard>
    </div>
  )
}
