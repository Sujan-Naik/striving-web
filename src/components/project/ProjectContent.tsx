import { HeadedCard, VariantEnum } from "headed-ui"
import { FileText, List } from "lucide-react"
import { KanbanBoard } from "@/components/github/kanban-board"
import { ProjectMeta } from "./ProjectMeta"
import styles from "@/styles/project.module.css"
import type { ProjectV2, ProjectV2Item } from "@/hooks/use-github-projects"

interface ProjectContentProps {
  project: ProjectV2
  projectId: string
  itemsByStatus: Record<string, ProjectV2Item[]>
  statusFieldId: string | null
  statusOptions: any[]
  revalidateProjectPage: () => Promise<void>
}

export function ProjectContent({
  project,
  projectId,
  itemsByStatus,
  statusFieldId,
  statusOptions,
  revalidateProjectPage
}: ProjectContentProps) {
  return (
    <HeadedCard variant={VariantEnum.Primary}>
      <ProjectMeta project={project} />

      {project.shortDescription && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.errorMessage}>{project.shortDescription}</p>
        </div>
      )}

      {project.readme && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FileText className="h-5 w-5" />
            README
          </h2>
          <HeadedCard variant={VariantEnum.Secondary}>
            <div className={styles.readmeContent}>
              <pre className={styles.readmeText}>{project.readme}</pre>
            </div>
          </HeadedCard>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <List className="h-5 w-5" />
          Kanban Board
        </h2>
        {Object.keys(itemsByStatus).length === 0 && project.items?.nodes?.length === 0 ? (
          <div className={styles.emptyState}>
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
  )
}

