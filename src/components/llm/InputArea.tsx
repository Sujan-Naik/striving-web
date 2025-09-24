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
    <div
  className="no-print"
  style={{
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--background-secondary)',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
    width: '100%',
  }}
>
  <div
    style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end',
    }}
  >
    <textarea
      ref={textareaRef}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type your message here... (Shift+Enter for new line)"
      disabled={loading}
      style={{
        flex: 1,
        minHeight: '50px',
        maxHeight: '120px',
        padding: '15px 20px',
        border: '2px solid var(--border-color)',
        borderRadius: '25px',
        outline: 'none',
        fontSize: '15px',
        fontFamily: 'inherit',
        backgroundColor: loading ? 'var(--disabled)' : 'var(--background-primary)',
        color: loading ? 'var(--foreground-tertiary)' : 'var(--foreground-primary)'
      }}
    />
    <HeadedButton
      variant={VariantEnum.Secondary}
      onClick={onSend}
      disabled={loading || !query.trim()}
    >
      {loading ? '●●●' : 'Send'}
    </HeadedButton>
  </div>
  <div
    style={{
      fontSize: '13px',
      color: 'var(--link-color)',
      marginTop: '12px',
      textAlign: 'center',
    }}
  >
    Press Enter to send • Shift+Enter for new line
  </div>
</div>

  )
}