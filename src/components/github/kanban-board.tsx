"use client"

import { LinkIcon, Tag, Loader2 } from "lucide-react"
import type { ProjectV2Item, ProjectV2SingleSelectFieldOption } from "@/hooks/use-github-projects"
import Link from "next/link"
import { githubApi } from "@/lib/provider-api-client"
import { useState } from "react"
import { HeadedCard, VariantEnum } from "headed-ui" // Reverted to HeadedCard

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
        // Optionally show a toast or error message to the user
      } else {
        console.log("Item status updated successfully.")
        if (onItemUpdated) {
          onItemUpdated() // Trigger revalidation of the page
        }
      }
    } catch (error) {
      console.error("Error updating item status:", error)
    } finally {
      setUpdatingItemId(null)
    }
  }

  return (
    <div className="flex overflow-x-auto gap-4 p-4">
      {allColumns.map((status) => (
        <HeadedCard key={status} variant={VariantEnum.Secondary} className="flex-shrink-0 w-80">
          {" "}
          {/* Reverted to HeadedCard */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">
              {status} ({itemsByStatus[status]?.length || 0})
            </h3>
          </div>
          <div className="p-4 space-y-3 min-h-[100px]">
            {itemsByStatus[status]?.length > 0 ? (
              itemsByStatus[status].map((item) => {
                const currentStatusField = item.fieldValues?.nodes?.find(
                  (field) =>
                    (field.field?.name?.toLowerCase() === "status" || field.field?.name?.toLowerCase() === "state") &&
                    typeof field.name === "string",
                )
                const currentStatusOptionId =
                  statusOptions.find((opt) => opt.name === currentStatusField?.name)?.id || ""

                return (
                  <HeadedCard key={item.id} variant={VariantEnum.Primary} className="p-3 shadow-sm">
                    {" "}
                    {/* Reverted to HeadedCard */}
                    <h4 className="font-medium text-sm mb-1">
                      {item.content?.url ? (
                        <Link
                          href={item.content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {item.content?.title || item.content?.body || "Untitled Item"}
                          <LinkIcon className="h-3 w-3" />
                        </Link>
                      ) : (
                        item.content?.title || item.content?.body || "Untitled Item"
                      )}
                    </h4>
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
                    {item.content?.labels?.nodes && item.content.labels.nodes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.content.labels.nodes.map((label) => (
                          <span
                            key={label.name}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1"
                          >
                            <Tag className="h-3 w-3" />
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Status Selector */}
                    {statusFieldId && statusOptions.length > 0 && (
                      <div className="mt-2">
                        <select
                          value={currentStatusOptionId}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          disabled={updatingItemId === item.id}
                        >
                          <option value="" disabled>
                            Select status
                          </option>
                          {statusOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                        {updatingItemId === item.id && <Loader2 className="h-3 w-3 animate-spin inline-block ml-1" />}
                      </div>
                    )}
                    {/* Display other relevant fields if available */}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      {item.fieldValues?.nodes.map((field, idx) => {
                        // Only display fields that are not the status field
                        if (
                          field.field?.name?.toLowerCase() === "status" ||
                          field.field?.name?.toLowerCase() === "state"
                        ) {
                          return null
                        }
                        const value = field.text || field.name || field.date || field.title
                        return value ? (
                          <span key={idx} className="flex items-center gap-1">
                            {field.field?.name}: {value}
                          </span>
                        ) : null
                      })}
                    </div>
                  </HeadedCard>
                )
              })
            ) : (
              <p className="text-muted-foreground text-sm">No items in this column.</p>
            )}
          </div>
        </HeadedCard>
      ))}
    </div>
  )
}
