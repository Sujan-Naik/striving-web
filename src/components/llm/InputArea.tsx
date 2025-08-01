import {useEffect} from 'react'
import styles from '@/styles/InputArea.module.css'
import {HeadedButton, VariantEnum} from "headed-ui";

interface InputAreaProps {
  query: string
  setQuery: (query: string) => void
  onSend: () => void
  loading: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export default function InputArea({ query, setQuery, onSend, loading, textareaRef }: InputAreaProps) {
  if (!textareaRef){
    throw new Error("No Text Area Reference")
  }
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className={`${styles.container} no-print`}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Shift+Enter for new line)"
          disabled={loading}
          className={styles.textarea}
        />
        <HeadedButton
            variant={VariantEnum.Secondary}
          onClick={onSend}
          disabled={loading || !query.trim()}
          className={styles.sendButton}
        >
          {loading ? '●●●' : 'Send'}
        </HeadedButton>
      </div>
      <div className={styles.hint}>
        Press <kbd>Enter</kbd> to send • <kbd>Shift+Enter</kbd> for new line
      </div>
    </div>
  )
}