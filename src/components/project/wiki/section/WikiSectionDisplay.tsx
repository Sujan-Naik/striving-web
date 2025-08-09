'use client';

import { useEffect, useState } from 'react';

interface WikiSection {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface WikiSectionProps {
  projectId: string;
  sectionId: string;
}

export default function WikiSectionDisplay({ projectId, sectionId }: WikiSectionProps) {
  const [section, setSection] = useState<WikiSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/wiki-sections/${sectionId}`);
        if (!response.ok) throw new Error('Failed to fetch section');
        const data = await response.json();
        setSection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [projectId, sectionId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!section) return <div>Section not found</div>;

  return (
    <div>
      <h1>{section.title}</h1>
      <div>{section.content}</div>
    </div>
  );
}