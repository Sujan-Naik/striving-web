import { githubApi } from "@/lib/provider-api-client"
import { HeadedCard, VariantEnum } from "headed-ui"
import { ExternalLink, Github, User, Calendar, Lock, Unlock, Archive, List, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params

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

  const project = result.data.data?.node

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Github className="h-8 w-8" />
          {project.title}
        </h1>
        <Link href="/github/projects" className="text-blue-500 hover:underline flex items-center gap-1">
          <List className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <HeadedCard variant={VariantEnum.Primary} className="p-6 space-y-4">
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
              <pre className="whitespace-pre-wrap font-mono text-sm">{project.readme}</pre>
            </HeadedCard>
          </div>
        )}

        {project.items?.nodes && project.items.nodes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <List className="h-5 w-5" />
              Project Items ({project.items.nodes.length})
            </h2>
            <div className="grid gap-3">
              {project.items.nodes.map((item: any) => (
                <HeadedCard variant={VariantEnum.Secondary} key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.content?.title || item.content?.body || "Untitled Item"}</h3>
                    {item.content?.url && (
                      <a
                        href={item.content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {item.content?.state && (
                    <span
                      className={`px-2 py-1 text-xs rounded mt-1 inline-block ${
                        item.content.state === "OPEN" || item.content.state === "OPENED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.content.state}
                    </span>
                  )}
                  {item.fieldValues?.nodes && item.fieldValues.nodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.fieldValues.nodes.map((field: any, idx: number) => {
                        const value = field.text || field.name || field.date || field.title
                        return value ? (
                          <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            {value}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </HeadedCard>
              ))}
            </div>
          </div>
        )}
      </HeadedCard>
    </div>
  )
}
