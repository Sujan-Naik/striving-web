import ReactMarkdown from 'react-markdown'
import { Message } from '@/types/messages'
import CodeBlock from './CodeBlock'
import styles from '@/styles/MessageBubble.module.css'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`${styles.messageWrapper} ${styles[message.role]}`}>
      <div className={`${styles.avatar} ${styles[`${message.role}Avatar`]}`}>
        {message.role === 'user' ? 'U' : 'AI'}
      </div>

      <div className={`${styles.bubble} ${styles[`${message.role}Bubble`]}`}>
        {message.role === 'user' ? (
          <pre className={styles.userContent}>{message.content}</pre>
        ) : (
          <ReactMarkdown components={{ code: CodeBlock }}>
            {message.content}
          </ReactMarkdown>
        )}
        <div className={`${styles.timestamp} ${styles[`${message.role}Timestamp`]}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}