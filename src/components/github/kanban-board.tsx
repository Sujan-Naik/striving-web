"use client"

import { HeadedCard, VariantEnum } from "headed-ui"
import { LinkIcon, Tag } from "lucide-react"
import type { ProjectV2Item } from "@/hooks/use-github-projects"
import Link from "next/link"

interface KanbanBoardProps {
  itemsByStatus: Record<string, ProjectV2Item[]>
}

export function KanbanBoard({ itemsByStatus }: KanbanBoardProps) {
  const defaultColumns = ["Todo", "In Progress", "Done", "No Status"]
  const allColumns = Array.from(new Set([...defaultColumns, ...Object.keys(itemsByStatus)]))

  return (
    <div className="flex overflow-x-auto gap-4 p-4">
      {allColumns.map((status) => (
        <HeadedCard key={status} variant={VariantEnum.Secondary} className="flex-shrink-0 w-80">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">
              {status} ({itemsByStatus[status]?.length || 0})
            </h3>
          </div>
          <div className="p-4 space-y-3 min-h-[100px]">
            {itemsByStatus[status]?.length > 0 ? (
              itemsByStatus[status].map((item) => (
                <HeadedCard key={item.id} variant={VariantEnum.Primary} className="p-3 shadow-sm">
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
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No items in this column.</p>
            )}
          </div>
        </HeadedCard>
      ))}
    </div>
  )
}
