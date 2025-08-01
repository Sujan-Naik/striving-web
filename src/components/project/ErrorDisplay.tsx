import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui"
import {AlertCircle} from "lucide-react"
import styles from "@/styles/project.module.css"

interface ErrorDisplayProps {
  title: string
  message: string
  iconColor: string
}

export function ErrorDisplay({ title, message, iconColor }: ErrorDisplayProps) {
  return (
    <div className={styles.container}>
      <HeadedCard variant={VariantEnum.Outline}>
        <div className={styles.errorContainer}>
          <AlertCircle className={`${styles.errorIcon} ${iconColor}`} />
          <h1 className={styles.errorTitle}>{title}</h1>
          <p className={styles.errorMessage}>{message}</p>
          <HeadedLink variant={VariantEnum.Secondary} href="/github/projects" className={styles.backLink}>
            Back to Projects
          </HeadedLink>
        </div>
      </HeadedCard>
    </div>
  )
}