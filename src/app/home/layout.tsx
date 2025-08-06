"use client"

import React, { useState, useRef, useEffect } from 'react';

export default function Layout({
  children,
  calendar,
  github,
    gmail,
}: {

  children: React.ReactNode
  calendar: React.ReactNode
  github: React.ReactNode
  gmail: React.ReactNode
}){


  // State for widths of each pane (percentage)
  const [sizes, setSizes] = useState({
    calendar: 33,
    github: 33,
    gmail: 33,
  });

  // Refs to handle drag events
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ from: string; startX: number } | null>(null);

  // Handle mouse down on drag handle
  const handleMouseDown = (section: string, startX: number) => {
    draggingRef.current = { from: section, startX };
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    const deltaX = e.clientX - draggingRef.current.startX;
    const containerWidth = containerRef.current?.offsetWidth || 1;

    // Convert delta to percentage
    const deltaPercent = (deltaX / containerWidth) * 100;

    // Calculate new sizes
    const fromSection = draggingRef.current.from;
    const toSection = getNextSection(fromSection);

    if (!toSection) return;

    type Sizes = {
  calendar: number;
  github: number;
  gmail: number;
};

    setSizes((prev: Sizes): Sizes => {
  const newPrev: Sizes = { ...prev };
  // Adjust sizes
  newPrev[fromSection as keyof Sizes] = Math.max(prev[fromSection as keyof Sizes] + deltaPercent, 10);
  newPrev[toSection as keyof Sizes] = Math.max(prev[toSection as keyof Sizes] - deltaPercent, 10);
  return newPrev;
});
    draggingRef.current.startX = e.clientX;
  };

  // Handle mouse up
  const handleMouseUp = () => {
    draggingRef.current = null;
  };

  // Attach global mouse events
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Helper to get the next section
  const getNextSection = (current: string) => {
    const order = ['calendar', 'github', 'gmail'];
    const index = order.indexOf(current);
    if (index === -1 || index === order.length - 1) return null;
    return order[index + 1];
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Calendar Pane */}
      <div style={{ flexBasis: `${sizes.calendar}%`, minWidth: '10%' }}>
        {/* Replace with your route/component */}
        <div style={{ padding: 10, height: '100%' }}>{calendar}</div>
      </div>

      {/* Drag handle */}
      <div
        style={{
          width: '5px',
          cursor: 'col-resize',
        }}
        onMouseDown={(e) => handleMouseDown('calendar', e.clientX)}
      />

      {/* GitHub Pane */}
      <div style={{ flexBasis: `${sizes.github}%`, minWidth: '10%' }}>
        {/* Replace with your route/component */}
        <div style={{ padding: 10, height: '100%' }}>{github}</div>
      </div>

      {/* Drag handle */}
      <div
        style={{
          width: '5px',
          cursor: 'col-resize',
        }}
        onMouseDown={(e) => handleMouseDown('github', e.clientX)}
      />

      {/* Gmail Pane */}
      <div style={{ flexBasis: `${sizes.gmail}%`, minWidth: '10%' }}>
        {/* Replace with your route/component */}
        <div style={{ padding: 10, height: '100%' }}>{gmail}</div>
      </div>

      {/* Drag handle */}
      <div
        style={{
          width: '5px',
          cursor: 'col-resize',
        }}
        onMouseDown={(e) => handleMouseDown('gmail', e.clientX)}
      />

    </div>
  );
}