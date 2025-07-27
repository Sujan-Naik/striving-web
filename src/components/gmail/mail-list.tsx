"use client"
import type {MailItem} from "@/hooks/use-gmail"
import {useGmail} from "@/hooks/use-gmail"
import {MailItemComponent} from "./mail-item"
import {Mail, RefreshCw} from "lucide-react"
import {HeadedButton, VariantEnum} from "headed-ui";

interface MailListProps {
  maxResults?: number
  onMailClick?: (mail: MailItem) => void
}

export function MailList({ maxResults = 10, onMailClick }: MailListProps) {
  const { mail, loading, error, refetch } = useGmail(maxResults)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load emails</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <HeadedButton onClick={refetch} variant={VariantEnum.Outline}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </HeadedButton>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gmail Messages</h2>
          {!loading && <HeadedButton onClick={refetch} variant={VariantEnum.Outline} >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </HeadedButton> }

      </div>

      {loading && mail.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading emails...</span>
        </div>
      ) : mail.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No emails found</h3>
          <p className="text-muted-foreground">Your inbox appears to be empty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mail.map((item) => (
            <MailItemComponent key={item.id} mail={item} onClick={onMailClick} />
          ))}
        </div>
      )}
    </div>
  )
}
