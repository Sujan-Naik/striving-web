import styles from '@/styles/Header.module.css'

interface HeaderProps {
  messageCount: number
  onClearChat: () => void
}

export default function Header({ messageCount, onClearChat }: HeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>AI Assistant</h1>
        <p className={styles.subtitle}>{messageCount} messages</p>
      </div>
      <button onClick={onClearChat} className={`${styles.clearButton} no-print`}>
        Clear Chat
      </button>
    </div>
  )
}