"use client"

import {LinkIcon, Loader2, Tag} from "lucide-react"
import type {ProjectV2Item, ProjectV2SingleSelectFieldOption} from "@/hooks/use-github-projects"
import {githubApi} from "@/lib/api-client"
import {useState} from "react"
import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui"
import styles from "@/styles/KanbanBoard.module.css"

interface KanbanBoardProps {
  projectId: string
  itemsByStatus: Record<string, ProjectV2Item[]>
  statusFieldId: string | null
  statusOptions: ProjectV2SingleSelectFieldOption[]
  onItemUpdated?: () => void
}

export function KanbanBoard({
  projectId,
  itemsByStatus,
  statusFieldId,
  statusOptions,
  onItemUpdated,
}: KanbanBoardProps) {
  const defaultColumns = ["Todo", "In Progress", "Done", "No Status"]
  const allColumns = Array.from(new Set([...defaultColumns, ...Object.keys(itemsByStatus)]))
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  const handleStatusChange = async (itemId: string, newStatusOptionId: string) => {
    if (!statusFieldId) {
      console.error("Status field ID is not available.")
      return
    }

    setUpdatingItemId(itemId)
    try {
      const result = await githubApi.updateProjectV2ItemFieldValue(projectId, itemId, statusFieldId, {
        singleSelectOptionId: newStatusOptionId,
      })

      if (!result.success) {
        console.error("Failed to update item status:", result.error)
      } else {
        console.log("Item status updated successfully.")
        onItemUpdated?.()
      }
    } catch (error) {
      console.error("Error updating item status:", error)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const getStateClassName = (state: string) => {
    return state === "OPEN" || state === "OPENED" ? styles.stateOpen : styles.stateClosed
  }

  const renderItemTitle = (item: ProjectV2Item) => {
    const title = item.content?.title || item.content?.body || "Untitled Item"

    if (item.content?.url) {
      return (
        <HeadedLink variant={VariantEnum.Secondary} href={item.content.url} className={styles.itemLink}>
          {title}
          <LinkIcon className={styles.linkIcon} />
        </HeadedLink>
      )
    }
    return title
  }

  const renderLabels = (item: ProjectV2Item) => {
    if (!item.content?.labels?.nodes?.length) return null

    return (
      <div className={styles.labelsContainer}>
        {item.content.labels.nodes.map((label) => (
          <span key={label.name} className={styles.label}>
            <Tag className={styles.tagIcon} />
            {label.name}
          </span>
        ))}
      </div>
    )
  }

  const renderStatusSelector = (item: ProjectV2Item) => {
    if (!statusFieldId || !statusOptions.length) return null

    const currentStatusField = item.fieldValues?.nodes?.find(
      (field) =>
        (field.field?.name?.toLowerCase() === "status" || field.field?.name?.toLowerCase() === "state") &&
        typeof field.name === "string",
    )
    const currentStatusOptionId = statusOptions.find((opt) => opt.name === currentStatusField?.name)?.id || ""

    return (
      <div className={styles.statusSelector}>
        <select
          value={currentStatusOptionId}
          onChange={(e) => handleStatusChange(item.id, e.target.value)}
          disabled={updatingItemId === item.id}
          className={styles.statusSelect}
        >
          <option value="" disabled>Select status</option>
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {updatingItemId === item.id && <Loader2 className={styles.spinner} />}
      </div>
    )
  }

  const renderOtherFields = (item: ProjectV2Item) => {
    const otherFields = item.fieldValues?.nodes.filter(
      (field) => !["status", "state"].includes(field.field?.name?.toLowerCase() || "")
    )

    if (!otherFields?.length) return null

    return (
      <div className={styles.otherFields}>
        {otherFields.map((field, idx) => {
          const value = field.text || field.name || field.date || field.title
          return value ? (
            <span key={idx}>
              {field.field?.name}: {value}
            </span>
          ) : null
        })}
      </div>
    )
  }

  return (
    <div className={styles.kanbanBoard}>
      {allColumns.map((status) => (
        <HeadedCard key={status} variant={VariantEnum.Secondary} className={styles.column}>
          <div className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>
              {status} ({itemsByStatus[status]?.length || 0})
            </h3>
          </div>
          <div className={styles.columnContent}>
            {itemsByStatus[status]?.length > 0 ? (
              itemsByStatus[status].map((item) => (
                <HeadedCard key={item.id} variant={VariantEnum.Primary} className={styles.item}>
                  <h4 className={styles.itemTitle}>
                    {renderItemTitle(item)}
                  </h4>
                  {item.content?.state && (
                    <span className={`${styles.state} ${getStateClassName(item.content.state)}`}>
                      {item.content.state}
                    </span>
                  )}
                  {renderLabels(item)}
                  {renderStatusSelector(item)}
                  {renderOtherFields(item)}
                </HeadedCard>
              ))
            ) : (
              <p className={styles.emptyColumn}>No items in this column.</p>
            )}
          </div>
        </HeadedCard>
      ))}
    </div>
  )
}