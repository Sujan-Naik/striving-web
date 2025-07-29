"use client"
import { useState, useEffect } from 'react';

export default function Page() {
  const [text, setText] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchStream() {
      const response = await fetch('/api/bedrock/converse-stream');
      const reader = response.body?.getReader();

      if (reader) {
        const decoder = new TextDecoder('utf-8');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (isMounted && value) {
            setText(prev => prev + decoder.decode(value, { stream: true }));
          }
        }
      }
    }

    fetchStream();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <p>{text}</p>
    </div>
  );
}