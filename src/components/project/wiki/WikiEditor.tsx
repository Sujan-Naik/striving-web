'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import WikiSectionEditor from './section/WikiSectionEditor';
import wikiSection from "@/models/WikiSection";

interface WikiData {
  _id?: string;
  content: string;
  wikiSection: string[];
}

export default function WikiEditor() {
  const { project } = useProject();
  const projectId = project._id;

  const [wiki, setWiki] = useState<WikiData>({
    content: '',
    wikiSection: []
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wikiExists, setWikiExists] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/wiki`);
        if (response.ok) {
          const existingWiki = await response.json();
          setWiki({
            _id: existingWiki._id,
            content: existingWiki.content || '',
            wikiSection: existingWiki.wikiSection || []
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
      const url = isEditing ? `/api/project/${projectId}/wiki` : `/api/project/${projectId}/wiki`;

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
        <textarea
          placeholder="Wiki Content"
          value={wiki.content}
          onChange={(e) => setWiki({ ...wiki, content: e.target.value })}
          rows={15}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Wiki' : 'Create Wiki'}
        </button>
      </form>

      {wiki.wikiSection.map(value => {
  return <WikiSectionEditor key={value} projectId={projectId} sectionId={value} />
})}
    </div>
  );
}