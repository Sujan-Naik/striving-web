"use client"

import type React from "react"
import { useState } from "react"
import { Plus, AlertCircle, CheckCircle } from "lucide-react"
import { githubApi } from "@/lib/provider-api-client"
import type { ProjectV2SingleSelectFieldOption } from "@/hooks/use-github-projects"
import { HeadedButton, HeadedCard, HeadedDialog, VariantEnum } from "headed-ui" // Reverted to Headed components

interface CreateProjectItemForm {
  title: string
  body: string
}

interface CreateProjectItemProps {
  projectId: string
  onItemCreated?: () => void
}

export function CreateProjectItem({ projectId, onItemCreated }: CreateProjectItemProps) {

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<CreateProjectItemForm>({
    title: "",
    body: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      setError("Item title is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const createIssueResult = await githubApi.createDraftIssue(
        projectId,
        form.title.trim(),
        form.body.trim() || undefined,
      )

      if (!createIssueResult.success) {
        setError(createIssueResult.error)
        return
      }

      if (createIssueResult.data.errors) {
        setError(createIssueResult.data.errors[0]?.message || "Failed to create item")
        return
      }


      setSuccess(true)
      setForm({ title: "", body: ""})

      if (onItemCreated) {
        onItemCreated()
      }

      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false)
      setError(null)
      setSuccess(false)
      setForm({ title: "", body: "" })
    }
  }

  return (
    <>
      <HeadedButton variant={VariantEnum.Primary} onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </HeadedButton>

      <HeadedDialog isOpen={isOpen} onClick={handleClose} title="Add New Project Item" variant={VariantEnum.Primary}>
        <HeadedCard variant={VariantEnum.Secondary} className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-700">Item Added!</h3>
                <p className="text-sm text-muted-foreground">Your new project item has been created successfully.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Item Title *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter item title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="body">Description (Optional)</label>
                <textarea
                  id="body"
                  placeholder="Enter item description..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  disabled={loading}
                  rows={4}
                />
              </div>


              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button type={"submit"} >
                  {loading ? "Adding..." : "Add Item"}
                </button>
                <HeadedButton variant={VariantEnum.Outline} onClick={handleClose}>
                  Cancel
                </HeadedButton>
              </div>
            </form>
          )}
        </HeadedCard>
      </HeadedDialog>
    </>
  )
}
