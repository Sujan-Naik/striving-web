import { useRef, useEffect } from 'react'
import { Message } from '@/types/messages'
import MessageBubble from './MessageBubble'
import StreamingMessage from './StreamingMessage'
import styles from '@/styles/MessageList.module.css'

interface MessageListProps {
  messages: Message[]
  currentResponse: string
}

export default function MessageList({ messages, currentResponse }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentResponse])

  return (
    <div className={styles.container}>
      {messages.length === 0 && !currentResponse && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          Start a conversation by typing a message below
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {currentResponse && <StreamingMessage content={currentResponse} />}
      <div ref={messagesEndRef} />
    </div>
  )
}