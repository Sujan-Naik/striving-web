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
          height: 'auto',
        maxWidth: '100%',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <div
        style={{
          minWidth: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          flexShrink: 0,
          backgroundColor: isUser ? 'var(--highlight)' : 'green',
        }}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      <div
        style={{
            display: 'block',
          maxWidth: '80%',
            height: 'auto',
          padding: '16px 20px',
          borderRadius: 'var(--border-radius-large)',
          fontSize: '15px',
          lineHeight: 1.5,
          backgroundColor: isUser
            ? 'var(--highlight)'
            : 'var(--background-secondary)',
          color: isUser ? 'white' : 'var(--foreground-secondary)',
          border: isUser ? 'none' : '1px solid var(--border-color)',
        }}
      >
        {isUser ? (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              margin: 0,
            }}
          >
            {message.content}
          </pre>
        ) : (
          <ReactMarkdown components={{ code: CodeBlock }}>
            {message.content}
          </ReactMarkdown>
        )}

        <div
          style={{
            fontSize: '12px',
            opacity: 0.7,
            marginTop: '8px',
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
