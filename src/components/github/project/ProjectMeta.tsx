import { Archive, Calendar, ExternalLink, Lock, Unlock, User } from "lucide-react"
import styles from "@/styles/project.module.css"
import type { ProjectV2 } from "@/hooks/use-github-projects"

interface ProjectMetaProps {
  project: ProjectV2
}

export function ProjectMeta({ project }: ProjectMetaProps) {
  return (
    <div className={styles.metaInfo}>
      <div className={styles.metaItem}>
        <User className="h-4 w-4" />
        {project.owner?.login || "Unknown Owner"}
      </div>
      <div className={styles.metaItem}>
        <Calendar className="h-4 w-4" />
        Updated {new Date(project.updatedAt).toLocaleDateString()}
      </div>
      <span className={`${styles.badge} ${project.closed ? styles.badgeClosed : styles.badgeOpen}`}>
        {project.closed && <Archive className="h-3 w-3" />}
        {project.closed ? "Closed" : "Open"}
      </span>
      <span className={`${styles.badge} ${project.public ? styles.badgePublic : styles.badgePrivate}`}>
        {project.public ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
        {project.public ? "Public" : "Private"}
      </span>
      <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.backLink}>
        View on GitHub
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}