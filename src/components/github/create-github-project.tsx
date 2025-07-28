"use client"

import type React from "react"

import { useState } from "react"
import { HeadedButton, HeadedCard, HeadedDialog, VariantEnum } from "headed-ui"
import { Plus, AlertCircle, CheckCircle } from "lucide-react"
import { githubApi } from "@/lib/provider-api-client"

interface CreateProjectForm {
  title: string
}

export function CreateGithubProject({ onProjectCreated }: { onProjectCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<CreateProjectForm>({ title: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      setError("Project title is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await githubApi.createProjectV2(form.title.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.data.errors) {
        setError(result.data.errors[0]?.message || "Failed to create project")
        return
      }

      setSuccess(true)
      setForm({ title: "" })

      // Call the callback to refresh the projects list
      if (onProjectCreated) {
        onProjectCreated()
      }

      // Close dialog after a short delay to show success
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
      setForm({ title: "" })
    }
  }

  return (
    <>
      <HeadedButton variant={VariantEnum.Primary} onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Project
      </HeadedButton>

      <HeadedDialog
        isOpen={isOpen}
        onClick={handleClose}
        title="Create New GitHub Project"
        variant={VariantEnum.Primary}
      >
        <HeadedCard variant={VariantEnum.Secondary} className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-700">Project Created!</h3>
                <p className="text-sm text-muted-foreground">Your new project has been created successfully.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Project Title *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter project title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <HeadedButton variant={VariantEnum.Primary}>
                  {loading ? "Creating..." : "Create Project"}
                </HeadedButton>
                <HeadedButton variant={VariantEnum.Outline} onClick={handleClose} >
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
