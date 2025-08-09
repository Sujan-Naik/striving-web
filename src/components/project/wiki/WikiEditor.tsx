'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import WikiSectionEditor from './section/WikiSectionEditor';

interface WikiData {
  _id?: string;
  content: string;
  wikiSection: string[];
}

interface Feature {
  _id: string;
  title: string;
  wikiSection?: string;
}

export default function WikiEditor() {
  const { project } = useProject();
  const projectId = project._id;

  const [wiki, setWiki] = useState<WikiData>({
    content: '',
    wikiSection: []
  });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedWikiSections, setSelectedWikiSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wikiExists, setWikiExists] = useState<boolean | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wikiResponse = await fetch(`/api/project/${projectId}/wiki`);
        if (wikiResponse.ok) {
          const existingWiki = await wikiResponse.json();
          setWiki({
            _id: existingWiki._id,
            content: existingWiki.content || '',
            wikiSection: existingWiki.wikiSection || []
          });
          setSelectedWikiSections(existingWiki.wikiSection || []);
          setIsEditing(true);
          setWikiExists(true);
        } else if (wikiResponse.status === 404) {
          setWikiExists(false);
        }

        const featuresResponse = await fetch(`/api/project/${projectId}/features`);
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setWikiExists(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleWikiSectionToggle = (wikiSectionId: string) => {
    setSelectedWikiSections(prev =>
      prev.includes(wikiSectionId)
        ? prev.filter(id => id !== wikiSectionId)
        : [...prev, wikiSectionId]
    );
  };

  const updateWikiSections = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/project/${projectId}/wiki/wiki-section`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wikiSection: selectedWikiSections })
      });

      if (response.ok) {
        setWiki(prev => ({ ...prev, wikiSection: selectedWikiSections }));
        alert('Wiki sections updated successfully');
      }
    } catch (error) {
      console.error('Error updating wiki sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(`/api/project/${projectId}/wiki`, {
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

  const handleDragStart = (wikiSectionId: string) => {
    setDraggedItem(wikiSectionId);
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const currentIndex = selectedWikiSections.indexOf(draggedItem);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    const newOrder = [...selectedWikiSections];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setSelectedWikiSections(newOrder);
    setDraggedItem(null);
  };

  if (wikiExists === null) {
    return <div>Loading...</div>;
  }

  const availableFeatures = features.filter(feature =>
    feature.wikiSection && !selectedWikiSections.includes(feature.wikiSection)
  );

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

      <div>
        <h3>Select & Order Wiki Sections</h3>
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
                    onChange={() => handleWikiSectionToggle(feature.wikiSection!)}
                  />
                  <span>{feature.title}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Selected sections (right) */}
          <div style={{ flex: 1 }}>
            <h4>Selected Sections (Ordered)</h4>
            {selectedWikiSections.map((wikiSectionId, index) => {
              const feature = features.find(f => f.wikiSection === wikiSectionId);
              if (!feature) return null;

              return (
                <div
                  key={wikiSectionId}
                  draggable
                  onDragStart={() => handleDragStart(wikiSectionId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  style={{
                    padding: '8px',
                    margin: '4px 0',
                    border: '1px solid #ccc',
                    backgroundColor: '#f0f8ff',
                    cursor: 'move',
                    opacity: draggedItem === wikiSectionId ? 0.5 : 1
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleWikiSectionToggle(wikiSectionId)}
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

        <button onClick={updateWikiSections} disabled={loading}>
          Update Wiki Sections
        </button>
      </div>

      {wiki.wikiSection.map(value => (
        <WikiSectionEditor key={value} projectId={projectId} sectionId={value} />
      ))}
    </div>
  );
}