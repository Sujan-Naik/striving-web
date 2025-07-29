"use client"
import { useRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {inline} from "@floating-ui/dom";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-indent code function
  const autoIndentCode = (text: string): string => {
    const lines = text.split('\n');
    const indentedLines = lines.map((line, index) => {
      // Skip first line
      if (index === 0) return line;

      // Check if this looks like code (contains common programming patterns)
      const codePatterns = [
        /^\s*(function|const|let|var|if|for|while|class|def|import|export)/,
        /^\s*[{}()[\];]/,
        /^\s*\/\/|^\s*\/\*|^\s*\*/,
        /^\s*<\/?[a-zA-Z]/,
        /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:]/
      ];

      const prevLine = lines[index - 1];
      const isCodeBlock = codePatterns.some(pattern => pattern.test(line) || pattern.test(prevLine));

      if (isCodeBlock && line.trim() && !line.startsWith('  ')) {
        return '  ' + line;
      }

      return line;
    });

    return indentedLines.join('\n');
  };

  async function handleSend() {
    if (!query.trim() || loading) return;

    const processedQuery = autoIndentCode(query.trim());

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: processedQuery,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = processedQuery;
    setQuery('');
    setLoading(true);
    setCurrentResponse('');

    try {
      const response = await fetch('/api/bedrock/converse-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentQuery })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setCurrentResponse(fullResponse);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCurrentResponse('');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([]);
    setCurrentResponse('');
    setQuery('');
    textareaRef.current?.focus();
  }

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f5f5f5;
        }
        
        #__next {
          height: 100%;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Print styles for screenshots */
        @media print {
          body {
            background-color: white !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e1e5e9',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <div>
            <h1 style={{
              margin: 0,
              color: '#2c3e50',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              AI Assistant
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              {messages.length} messages
            </p>
          </div>
          <button
            onClick={clearChat}
            className="no-print"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            Clear Chat
          </button>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: '#fafafa'
        }}>
          {messages.length === 0 && !currentResponse && (
            <div style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '16px',
              marginTop: '100px',
              fontStyle: 'italic'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              Start a conversation by typing a message below
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '12px',
              maxWidth: '100%'
            }}>
              <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: message.role === 'user' ? '#007bff' : '#28a745',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {message.role === 'user' ? 'U' : 'AI'}
              </div>

              <div style={{
                maxWidth: '80%',
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: message.role === 'user' ? '#007bff' : '#ffffff',
                color: message.role === 'user' ? 'white' : '#2c3e50',
                border: message.role === 'assistant' ? '1px solid #e1e5e9' : 'none',
                boxShadow: message.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                fontSize: '15px',
                lineHeight: '1.5'
              }}>
                {message.role === 'user' ? (
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    margin: 0
                  }}>
                    {message.content}
                  </pre>
                ) : (
                  <ReactMarkdown
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props} style={{
                            backgroundColor: '#f8f9fa',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            fontSize: '0.9em'
                          }}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
                <div style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginTop: '8px',
                  textAlign: message.role === 'user' ? 'right' : 'left'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Current streaming response */}
          {currentResponse && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#28a745',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                AI
              </div>

              <div style={{
                maxWidth: '80%',
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e1e5e9',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                <ReactMarkdown
                  components={{
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props} style={{
                          backgroundColor: '#f8f9fa',
                          padding: '2px 4px',
                          borderRadius: '3px',
                          fontSize: '0.9em'
                        }}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {currentResponse}
                </ReactMarkdown>
                <div style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  marginLeft: '4px'
                }} className="pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="no-print" style={{
          padding: '20px 24px',
          borderTop: '1px solid #e1e5e9',
          backgroundColor: '#ffffff',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Shift+Enter for new line)"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '50px',
                  maxHeight: '120px',
                  padding: '15px 20px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '25px',
                  outline: 'none',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  backgroundColor: loading ? '#f8f9fa' : 'white',
                  resize: 'none',
                  lineHeight: '1.5',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              style={{
                padding: '15px 30px',
                backgroundColor: loading || !query.trim() ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                minWidth: '100px',
                height: '50px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading && query.trim()) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && query.trim()) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }
              }}
            >
              {loading ? '●●●' : 'Send'}
            </button>
          </div>

          <div style={{
            fontSize: '13px',
            color: '#6c757d',
            marginTop: '12px',
            textAlign: 'center'
          }}>
            Press <kbd style={{
              backgroundColor: '#f8f9fa',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #e1e5e9'
            }}>Enter</kbd> to send • <kbd style={{
              backgroundColor: '#f8f9fa',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #e1e5e9'
            }}>Shift+Enter</kbd> for new line
          </div>
        </div>
      </div>
    </>
  );
}