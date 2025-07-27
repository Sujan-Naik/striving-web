"use client"

import type {MailItem} from "@/hooks/use-gmail"
import {HeadedCard, VariantEnum} from "headed-ui";

interface MailItemProps {
  mail: MailItem
  onClick?: (mail: MailItem) => void
}

export function MailItemComponent({ mail, onClick }: MailItemProps) {
  const formatSender = (sender: string) => {
    const match = sender.match(/^(.+?)\s*<(.+)>$/)
    return match ? match[1] : sender
  }

  return (
    <HeadedCard variant={VariantEnum.Primary}
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${!mail.isRead ? "border-l-4 border-l-blue-500" : ""}`}
    >
      <header className="pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-medium truncate">{mail.subject}</h1>
          {!mail.isRead && (
            <HeadedCard variant={VariantEnum.Secondary} className="ml-2">
              New
            </HeadedCard>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="truncate">{formatSender(mail.sender)}</span>
          <span className="whitespace-nowrap ml-2">
            {mail.date.toLocaleDateString()} {mail.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>
      <HeadedCard variant={VariantEnum.Tertiary} className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{mail.snippet}</p>
      </HeadedCard>
    </HeadedCard>
  )
}
