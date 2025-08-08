'use client';

import { useState, useEffect } from 'react';
import {useProject} from "@/context/ProjectContext";

interface WikiData {
  title: string;
  description: string;
  content: string;
}

export default function WikiEditor() {
  const { project } = useProject();
  const projectId = project._id

  const [wiki, setWiki] = useState<WikiData>({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/project/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...wiki, project: projectId })
      });

      if (response.ok) {
        alert('Wiki saved successfully');
      }
    } catch (error) {
      console.error('Error saving wiki:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={wiki.title}
        onChange={(e) => setWiki({ ...wiki, title: e.target.value })}
        required
      />

      <textarea
        placeholder="Description"
        value={wiki.description}
        onChange={(e) => setWiki({ ...wiki, description: e.target.value })}
      />

      <textarea
        placeholder="Content"
        value={wiki.content}
        onChange={(e) => setWiki({ ...wiki, content: e.target.value })}
        rows={10}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Wiki'}
      </button>
    </form>
  );
}