import {useState} from 'react'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {tomorrow} from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from '@/styles/CodeBlock.module.css'
import {HeadedButton, VariantEnum} from "headed-ui";

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
      <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>

        <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div">
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
        <HeadedButton variant={VariantEnum.Secondary} onClick={copyCode}>
          {copied ? 'Copied!' : 'Copy'}
        </HeadedButton>
      </div>
    )
  }

  return (
    <code>
      {children}
    </code>
  )
}