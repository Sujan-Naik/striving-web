'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";

interface DocumentationData {
  _id?: string;
  content: string;
  documentationSection: string[];
}

export default function DocumentationEditor() {
  const { project } = useProject();
  const projectId = project._id;

  const [documentation, setDocumentation] = useState<DocumentationData>({
    content: '',
    documentationSection: []
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [documentationExists, setDocumentationExists] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/documentation`);
        if (response.ok) {
          const existingDocumentation = await response.json();
          setDocumentation({
            _id: existingDocumentation._id,
            content: existingDocumentation.content || '',
            documentationSection: existingDocumentation.documentationSection || []
          });
          setIsEditing(true);
          setDocumentationExists(true);
        } else if (response.status === 404) {
          setDocumentationExists(false);
        }
      } catch (error) {
        console.error('Error fetching documentation:', error);
        setDocumentationExists(false);
      }
    };

    if (projectId) {
      fetchDocumentation();
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/project/${projectId}/documentation` : `/api/project/${projectId}/documentation`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...documentation, project: projectId })
      });

      if (response.ok) {
        const savedDocumentation = await response.json();
        setDocumentation(savedDocumentation);
        setIsEditing(true);
        setDocumentationExists(true);
        alert(`Documentation ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error saving documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (documentationExists === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!documentationExists && (
        <div>
          <h3>No documentation found for this project</h3>
          <p>Create a new documentation to get started.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Documentation Content"
          value={documentation.content}
          onChange={(e) => setDocumentation({ ...documentation, content: e.target.value })}
          rows={15}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Documentation' : 'Create Documentation'}
        </button>
      </form>
    </div>
  );
}