import { HeadedButton, HeadedCard, VariantEnum } from "headed-ui";
import { useState } from "react";

interface HeaderProps {
  messageCount: number
  onClearChat: () => void
}

export default function SideBar({ messageCount, onClearChat }: HeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <HeadedCard
      variant={VariantEnum.Secondary}
      style={{
        position: "relative",
        left: 0,
        top: 0,
        height: "100vh",
        width: isExpanded ? "250px" : "50px",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s"
      }}
    >
      <HeadedButton
        variant={VariantEnum.Tertiary}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "←" : "→"}
      </HeadedButton>

      {isExpanded && (
        <>
          <HeadedCard variant={VariantEnum.Tertiary}>
            <h2>AI Assistant</h2>
          </HeadedCard>

          <HeadedCard variant={VariantEnum.Tertiary}>
            <p>{messageCount} messages</p>
          </HeadedCard>

          <HeadedButton variant={VariantEnum.Tertiary} onClick={onClearChat}>
            Clear Chat
          </HeadedButton>
        </>
      )}
    </HeadedCard>
  )
}