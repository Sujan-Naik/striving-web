"use client"
import { useRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Page() {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  async function handleFetch() {
    setLoading(true);
    const response = await fetch(`/api/bedrock/converse-stream?query=${encodeURIComponent(query)}`);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Append new chunk to existing text
        setText(prev => prev + decoder.decode(value, { stream: true }));
      }
    }
    setLoading(false);
  }

  // Auto-scroll to bottom when text updates
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleFetch();
          }
        }}
        placeholder="Enter your query"
        style={{ width: '300px' }}
      />
      <button
        onClick={handleFetch}
        disabled={loading}
        style={{ marginLeft: '10px' }}
      >
        {loading ? 'Loading...' : 'Send'}
      </button>
      <div
        style={{
          marginTop: '20px',
          height: '200px',
          overflowY: 'auto'
        }}
        ref={textRef}
      >
        {/* Render markdown content */}
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}