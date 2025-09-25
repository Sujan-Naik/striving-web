import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Message } from '@/types/messages';
import MessageBubble from './MessageBubble';
import StreamingMessage from './StreamingMessage';

interface MessageListProps {
  messages: Message[];
  currentResponse: string;
}

export default function MessageList({ messages, currentResponse }: MessageListProps) {
  const [atBottom, setAtBottom] = useState(true);

  // Merge streaming response into the list as a temporary assistant message
  const displayMessages: (Message | { id: string; role: 'assistant'; content: string })[] =
    currentResponse
      ? [...messages, { id: 'streaming', role: 'assistant', content: currentResponse }]
      : messages;

  // Empty state
  if (displayMessages.length === 0) {
    return (
      <div className="flex flex-1 h-full items-center justify-center p-6 text-center text-foreground-tertiary bg-background-tertiary">
        <div>
          <div className="text-5xl mb-4">💬</div>
          <div className="text-base italic">
            Start a conversation by typing a message below
          </div>
        </div>
      </div>
    );
  }

  return (
  <Virtuoso<Message | { id: string; role: 'assistant'; content: string }>
  style={{
    height: '100%',
    width: '100%',
    // DO NOT set overflow: 'hidden' - Virtuoso needs to scroll internally
  }}
  data={displayMessages}
  itemContent={(_, m) =>
    m.id === 'streaming' ? (
      <StreamingMessage content={m.content} />
    ) : (
      <MessageBubble message={m as Message} />
    )
  }
  computeItemKey={(_, m) => m.id}
  alignToBottom
  atBottomStateChange={setAtBottom}
  followOutput={atBottom ? 'smooth' : false}
  components={{
    List: (props) => (
      <div
        {...props}
        id="virtuoso-item-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '12px', // Add some padding for better appearance
          margin: '0',
          boxSizing: 'border-box',
        }}
      />
    ),
    Item: (props) => (
      <div
        {...props}
        style={{
          display: 'block',
          minHeight: 'auto',
          boxSizing: 'border-box',
          // Ensure items don't create their own scroll
          overflow: 'visible',
        }}
      />
    ),
    // Optional: Customize the scrollbar if needed
    Scroller: React.forwardRef((props, ref) => (
      <div
        {...props}
        ref={ref}
        style={{
          ...props.style,
          // Custom scrollbar styling if desired
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
        }}
      />
    )),
  }}
  increaseViewportBy={200}
  overscan={5} // Render a few extra items for smoother scrolling
/>
);
}
