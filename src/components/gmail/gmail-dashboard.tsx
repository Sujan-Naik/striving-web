"use client"

import { useState } from "react"
import { MailList } from "./mail-list"
import { Settings } from "lucide-react"
import type { MailItem } from "@/hooks/use-gmail"
import {HeadedButton, HeadedCard, VariantEnum} from "headed-ui";

export function GmailDashboard() {
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null)
  const [maxResults, setMaxResults] = useState(10)

  const handleMailClick = (mail: MailItem) => {
    setSelectedMail(mail)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mail List */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-4">
            <input
              type="number"
              placeholder="Max results"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-32"
              min={1}
              max={100}
            />
            <HeadedButton variant={VariantEnum.Secondary}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </HeadedButton>
          </div>
          <MailList maxResults={maxResults} onMailClick={handleMailClick} />
        </div>

        {/* Mail Preview */}
        <div className="lg:col-span-1">
          <HeadedCard variant={VariantEnum.Primary}>
          <h1>Email Preview</h1>
          <HeadedCard variant={VariantEnum.Secondary}>
              {selectedMail ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedMail.subject}</h3>
                    <p className="text-sm text-muted-foreground">From: {selectedMail.sender}</p>
                    <p className="text-sm text-muted-foreground">{selectedMail.date.toLocaleString()}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm">{selectedMail.snippet}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Select an email to preview</p>
              )}
            </HeadedCard>
          </HeadedCard>
        </div>
      </div>
    </div>
  )
}
