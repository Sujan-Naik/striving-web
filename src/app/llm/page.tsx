"use client"
import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/messages'
import Header from '@/components/llm/Header'
import MessageList from '@/components/llm/MessageList'
import InputArea from '@/components/llm/InputArea'
import { autoIndentCode } from '@/lib/utils/codeUtils'
import '@/styles/globals.css'

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    if (!query.trim() || loading) return

    const processedQuery = autoIndentCode(query.trim())
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: processedQuery,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentQuery = processedQuery
    setQuery('')
    setLoading(true)
    setCurrentResponse('')

    try {
      const response = await fetch('/api/bedrock/converse-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery })
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setCurrentResponse(fullResponse)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setCurrentResponse('')
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function clearChat() {
    setMessages([])
    setCurrentResponse('')
    setQuery('')
    textareaRef.current?.focus()
  }

  return (
    <div className="chat-container">
      <Header messageCount={messages.length} onClearChat={clearChat} />
      <MessageList messages={messages} currentResponse={currentResponse} />
      <InputArea
        query={query}
        setQuery={setQuery}
        onSend={handleSend}
        loading={loading}
        textareaRef={textareaRef}
      />
    </div>
  )
}