import ReactMarkdown from 'react-markdown';
import CodeBlock from '@/components/llm/CodeBlock';

interface StreamingMessageProps {
  content: string;
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '100%',
        flexDirection: 'row', // assistant layout
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
          backgroundColor: 'green', // assistant avatar color
        }}
      >
        AI
      </div>

      <div
        style={{
            display: 'block',
          maxWidth: '80%',
          padding: '16px 20px',
          borderRadius: 'var(--border-radius-large)',
          fontSize: '15px',
          lineHeight: 1.5,
          backgroundColor: 'var(--background-secondary)',
          color: 'var(--foreground-secondary)',
          border: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        <ReactMarkdown components={{ code: CodeBlock }}>{content}</ReactMarkdown>

        {/* Pulse indicator */}
        <div
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: 'green',
            borderRadius: '50%',
            marginLeft: '4px',
          }}
        />
      </div>
    </div>
  );
}
