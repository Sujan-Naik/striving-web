"use client"
import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/messages'
import SideBar from '@/components/llm/SideBar'
import MessageList from '@/components/llm/MessageList'
import InputArea from '@/components/llm/InputArea'
import { autoIndentCode } from '@/lib/utils/codeUtils'
import '@/styles/globals.css'

type CostInfo = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  latencyMs?: number
}

type ChatTotals = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  totalCost: number
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Cost state
  const [lastTurnCost, setLastTurnCost] = useState<CostInfo | null>(null)
  const [chatTotals, setChatTotals] = useState<ChatTotals>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    totalCost: 0,
  })
  const STORAGE_KEYS = {
    messages: 'chat.messages.v1',
    totals: 'chat.totals.v1',
  }

  function reviveMessages(raw: unknown): Message[] {
    if (!Array.isArray(raw)) return []
    return raw.map((m: any) => ({
      ...m,
      timestamp: m?.timestamp ? new Date(m.timestamp) : new Date()
    }))
  }

  function safeParse<T>(str: string | null, fallback: T): T {
    if (!str) return fallback
    try { return JSON.parse(str) as T } catch { return fallback }
  }

  // 1) Track hydration so we don't write defaults before we load
const hydrated = useRef(false)

// Load from localStorage
useEffect(() => {
  try {
    const msgRaw = localStorage.getItem(STORAGE_KEYS.messages)
    const loadedMessages = reviveMessages(safeParse(msgRaw, []))
    if (loadedMessages.length) setMessages(loadedMessages)

    const totalsRaw = localStorage.getItem(STORAGE_KEYS.totals)
    const loadedTotals = safeParse<ChatTotals | null>(totalsRaw, null)
    if (loadedTotals) setChatTotals(loadedTotals)
  } catch {
    // ignore storage errors
  } finally {
    hydrated.current = true
  }
}, [])

// Persist to localStorage when messages change (unchanged)
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages))
  } catch {}
}, [messages])

// 2) Persist totals whenever they change (and only after hydration)
useEffect(() => {
  if (!hydrated.current) return
  try {
    localStorage.setItem(STORAGE_KEYS.totals, JSON.stringify(chatTotals))
  } catch {}
}, [chatTotals])



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
    setLastTurnCost(null)

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

      // Usage parsing
      const USAGE_MARKER = '[[USAGE]]'
      let foundUsageMarker = false
      let usageBuffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunkStr = decoder.decode(value, { stream: true })

          if (!foundUsageMarker) {
            const idx = chunkStr.indexOf(USAGE_MARKER)
            if (idx === -1) {
              fullResponse += chunkStr
              setCurrentResponse(fullResponse)
            } else {
              const before = chunkStr.slice(0, idx)
              fullResponse += before
              setCurrentResponse(fullResponse)

              usageBuffer = chunkStr.slice(idx + USAGE_MARKER.length)
              foundUsageMarker = true
            }
          } else {
            usageBuffer += chunkStr
          }
        }

        // Parse usage if present
        if (foundUsageMarker) {
          try {
            const parsed: CostInfo = JSON.parse(usageBuffer.trim())
            setLastTurnCost(parsed)
            setChatTotals(prev => ({
              inputTokens: prev.inputTokens + (parsed.inputTokens || 0),
              outputTokens: prev.outputTokens + (parsed.outputTokens || 0),
              totalTokens: prev.totalTokens + (parsed.totalTokens || 0),
              totalCost: prev.totalCost + (parsed.totalCost || 0),
            }))
          } catch (e) {
            console.warn('Failed to parse usage payload', e, usageBuffer)
          }
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
    setLastTurnCost(null)
    setChatTotals({ inputTokens: 0, outputTokens: 0, totalTokens: 0, totalCost: 0 })

    try {
      localStorage.removeItem(STORAGE_KEYS.messages)
      localStorage.removeItem(STORAGE_KEYS.totals)
    } catch {
      // ignore storage errors
    }

    textareaRef.current?.focus()
  }

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SideBar messageCount={messages.length} onClearChat={clearChat} />
      <div className="chat-container">
        <InputArea
          query={query}
          setQuery={setQuery}
          onSend={handleSend}
          loading={loading}
          textareaRef={textareaRef}
        />

        <div style={{ fontSize: 12, color: 'var(--disabled)', padding: '4px 8px', display: 'flex',
        justifyContent: 'space-between'}}>
          {lastTurnCost ? (
            <>
              <span>This message: ${lastTurnCost.totalCost.toFixed(6)}</span>
              <span>•</span>
              <span> tokens in/out/total: {lastTurnCost.inputTokens}/{lastTurnCost.outputTokens}/{lastTurnCost.totalTokens}</span>
              {typeof lastTurnCost.latencyMs === 'number' && (
                  <><span>•</span><span> latency: {lastTurnCost.latencyMs} ms</span></>
              )}
              <span> • </span>
              <span>Chat total: ${chatTotals.totalCost.toFixed(6)}</span>
              <span> • tokens: {chatTotals.totalTokens}</span>
            </>
          ) : (
            <>
              <span>{loading ? 'Generating…' : 'Ready'}</span>
              <span>•</span>
              <span>Chat total: ${chatTotals.totalCost.toFixed(6)}</span>
              <span>•</span>
              <span> total tokens: {chatTotals.totalTokens}</span>
            </>
          )}
        </div>

        <MessageList messages={messages} currentResponse={currentResponse} />
      </div>
    </div>
  )
}