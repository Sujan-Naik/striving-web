import { useRef, useEffect } from 'react';
import { Message } from '@/types/messages';
import MessageBubble from './MessageBubble';
import StreamingMessage from './StreamingMessage';

interface MessageListProps {
  messages: Message[];
  currentResponse: string;
}

export default function MessageList({ messages, currentResponse }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'block',
        flexDirection: 'column',
        gap: '24px',
        backgroundColor: 'var(--background-tertiary)',
      }}
    >
      {messages.length === 0 && !currentResponse && (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--foreground-tertiary)',
            fontSize: '16px',
            marginTop: '100px',
            fontStyle: 'italic',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            💬
          </div>
          Start a conversation by typing a message below
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {currentResponse && <StreamingMessage content={currentResponse} />}
      <div ref={messagesEndRef} />
    </div>
  );
}
