import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from '@/styles/CodeBlock.module.css'

interface CodeBlockProps {
  className?: string
  children?: React.ReactNode
}

export default function CodeBlock({ className, children}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')

  const copyCode = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (match) {
    return (
      <div className={styles.codeContainer}>
        <button onClick={copyCode} className={styles.copyButton}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div">
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    )
  }

  return (
    <code className={styles.inlineCode}>
      {children}
    </code>
  )
}