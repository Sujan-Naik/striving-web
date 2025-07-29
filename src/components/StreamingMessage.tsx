import ReactMarkdown from 'react-markdown'
import CodeBlock from '@/components/CodeBlock'
import styles from '@/styles/MessageBubble.module.css'

interface StreamingMessageProps {
  content: string
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className={`${styles.messageWrapper} ${styles.assistant}`}>
      <div className={`${styles.avatar} ${styles.assistantAvatar}`}>AI</div>
      <div className={`${styles.bubble} ${styles.assistantBubble}`}>
        <ReactMarkdown components={{ code: CodeBlock }}>{content}</ReactMarkdown>
        <div className={styles.pulse} />
      </div>
    </div>
  )
}