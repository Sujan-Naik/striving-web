'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import DocumentationSectionEditor from './section/DocumentationSectionEditor';

interface DocsData {
  _id?: string;
  content: string;
  documentationSection: string[];
}

interface Feature {
  _id: string;
  title: string;
  documentationSection?: string;
}

export default function DocsEditor() {
  const { project } = useProject();
  const projectId = project._id;

  const [docs, setDocs] = useState<DocsData>({
    content: '',
    documentationSection: []
  });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedDocumentationSections, setSelectedDocumentationSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docsExists, setDocsExists] = useState<boolean | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docsResponse = await fetch(`/api/project/${projectId}/docs`);
        if (docsResponse.ok) {
          const existingDocs = await docsResponse.json();
          setDocs({
            _id: existingDocs._id,
            content: existingDocs.content || '',
            documentationSection: existingDocs.documentationSection || []
          });
          setSelectedDocumentationSections(existingDocs.documentationSection || []);
          setIsEditing(true);
          setDocsExists(true);
        } else if (docsResponse.status === 404) {
          setDocsExists(false);
        }

        const featuresResponse = await fetch(`/api/project/${projectId}/features`);
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setDocsExists(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);


  const handleDocumentationSectionToggle = (documentationSectionId: string) => {
    setSelectedDocumentationSections(prev =>
      prev.includes(documentationSectionId)
        ? prev.filter(id => id !== documentationSectionId)
        : [...prev, documentationSectionId]
    );
  };

  const updateDocumentationSections = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/project/${projectId}/docs/documentation-section`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentationSection: selectedDocumentationSections })
      });

      if (response.ok) {
        setDocs(prev => ({ ...prev, documentationSection: selectedDocumentationSections }));
        alert('Docs sections updated successfully');
      }
    } catch (error) {
      console.error('Error updating docs sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(`/api/project/${projectId}/docs`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...docs, project: projectId })
      });

      if (response.ok) {
        const savedDocs = await response.json();
        setDocs(savedDocs);
        setIsEditing(true);
        setDocsExists(true);
        alert(`Docs ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error('Error saving docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (documentationSectionId: string) => {
    setDraggedItem(documentationSectionId);
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const currentIndex = selectedDocumentationSections.indexOf(draggedItem);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    const newOrder = [...selectedDocumentationSections];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setSelectedDocumentationSections(newOrder);
    setDraggedItem(null);
  };

  if (docsExists === null) {
    return <div>Loading...</div>;
  }

  const availableFeatures = features.filter(feature =>
    feature.documentationSection && !selectedDocumentationSections.includes(feature.documentationSection)
  );

  return (
    <div>
      {!docsExists && (
        <div>
          <h3>No docs found for this project</h3>
          <p>Create a new docs to get started.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Docs Content"
          value={docs.content}
          onChange={(e) => setDocs({ ...docs, content: e.target.value })}
          rows={15}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Docs' : 'Create Docs'}
        </button>
      </form>

      <div>
        <h3>Select & Order Docs Sections</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Available sections (left) */}
          <div style={{ flex: 1 }}>
            <h4>Available Sections</h4>
            {availableFeatures.map(feature => (
              <div
                key={feature._id}
                style={{
                  padding: '8px',
                  margin: '4px 0',
                  border: '1px solid #ccc',
                  backgroundColor: 'white'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleDocumentationSectionToggle(feature.documentationSection!)}
                  />
                  <span>{feature.title}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Selected sections (right) */}
          <div style={{ flex: 1 }}>
            <h4>Selected Sections (Ordered)</h4>
            {selectedDocumentationSections.map((documentationSectionId, index) => {
              const feature = features.find(f => f.documentationSection === documentationSectionId);
              if (!feature) return null;

              return (
                <div
                  key={documentationSectionId}
                  draggable
                  onDragStart={() => handleDragStart(documentationSectionId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  style={{
                    padding: '8px',
                    margin: '4px 0',
                    border: '1px solid #ccc',
                    backgroundColor: '#f0f8ff',
                    cursor: 'move',
                    opacity: draggedItem === documentationSectionId ? 0.5 : 1
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleDocumentationSectionToggle(documentationSectionId)}
                    />
                    <span>{feature.title}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                      #{index + 1}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={updateDocumentationSections} disabled={loading}>
          Update Docs Sections
        </button>
      </div>

      {docs.documentationSection.map(value => (

        <DocumentationSectionEditor key={value} projectId={projectId} sectionId={value} />
      ))}
    </div>
  );
}