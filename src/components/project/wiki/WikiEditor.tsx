'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";

interface WikiData {
  _id?: string;
  title: string;
  description: string;
  content: string;
}

export default function WikiEditor() {
  const { project } = useProject();
  const projectId = project._id;

  const [wiki, setWiki] = useState<WikiData>({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wikiExists, setWikiExists] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const response = await fetch(`/api/project/wiki/project/${projectId}`);
        if (response.ok) {
          const existingWiki = await response.json();
          setWiki({
            _id: existingWiki._id,
            title: existingWiki.title || '',
            description: existingWiki.description || '',
            content: existingWiki.content || ''
          });
          setIsEditing(true);
          setWikiExists(true);
        } else if (response.status === 404) {
          setWikiExists(false);
        }
      } catch (error) {
        console.error('Error fetching wiki:', error);
        setWikiExists(false);
      }
    };

    if (projectId) {
      fetchWiki();
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/project/wiki/${wiki._id}` : '/api/project/wiki';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...wiki, project: projectId })
      });

      if (response.ok) {
        const savedWiki = await response.json();
        setWiki(savedWiki);
        setIsEditing(true);
        setWikiExists(true);
        alert(`Wiki ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error saving wiki:', error);
    } finally {
      setLoading(false);
    }
  };

  if (wikiExists === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!wikiExists && (
        <div>
          <h3>No wiki found for this project</h3>
          <p>Create a new wiki to get started.</p>
        </div>
      )}

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
          {loading ? 'Saving...' : isEditing ? 'Update Wiki' : 'Create Wiki'}
        </button>
      </form>
    </div>
  );
}