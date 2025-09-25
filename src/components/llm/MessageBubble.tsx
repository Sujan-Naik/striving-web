import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/messages';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        flexDirection: isUser ? 'row-reverse' : 'row',
        width: '100%',
        minHeight: 'auto', // Let content determine height
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
          flexShrink: 0,
          backgroundColor: isUser ? 'var(--highlight)' : 'green',
        }}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Message bubble */}
      <div
        style={{
          maxWidth: '75%',
          minWidth: 0, // Important: allows flex child to shrink below content size
          padding: '12px 16px',
          borderRadius: 'var(--border-radius-large)',
          fontSize: 15,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          backgroundColor: isUser
            ? 'var(--highlight)'
            : 'var(--background-secondary)',
          color: isUser ? 'white' : 'var(--foreground-secondary)',
          border: isUser ? 'none' : '1px solid var(--border-color)',
          overflow: 'visible', // Let content flow naturally
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            overflow: 'visible', // No internal scrolling
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
          }}
        >
          {isUser ? (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                margin: 0,
                overflow: 'visible', // No scrolling on pre elements
              }}
            >
              {message.content}
            </pre>
          ) : (
            <div
              style={{
                overflow: 'visible', // Ensure ReactMarkdown content doesn't scroll
              }}
            >
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                  // Override any components that might create scrollable areas
                  pre: ({ children, ...props }) => (
                    <pre
                      {...props}
                      style={{
                        overflow: 'visible',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: '0',
                      }}
                    >
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontSize: 12,
            opacity: 0.7,
            marginTop: 8,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}