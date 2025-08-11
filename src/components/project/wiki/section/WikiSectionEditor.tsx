'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {IWikiSection} from "@/types/project/WikiSection";


export default function WikiSectionEditor({ projectId, wikiSection }: {projectId: string, wikiSection: IWikiSection}) {
  const [section, setSection] = useState<IWikiSection>(wikiSection);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/project/${projectId}/wiki-sections/${section._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) throw new Error('Failed to save section');
      const updatedSection = await response.json();
      setSection(updatedSection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/project/${projectId}/wiki-sections/${section._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete section');
      router.push(`/project/${projectId}/wiki`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!section) return <div>Section not found</div>;

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Section title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Section content"
        rows={10}
      />
      <div>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}