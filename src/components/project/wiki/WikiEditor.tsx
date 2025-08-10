'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import WikiSectionEditor from './section/WikiSectionEditor';

interface PopulatedWikiSection {
  _id: string;
  title: string;
  content: string;
}

interface WikiSection {
  wikiSection: string | PopulatedWikiSection; // Can be ID or populated object
  order: number;
  level: number;
  parentSection?: string;
}

interface WikiData {
  _id?: string;
  content: string;
  wikiSections: WikiSection[];
}

interface Feature {
  _id: string;
  title: string;
  parent?: string;
  children: string[];
  wikiSection?: string;
}

export default function WikiEditor() {
  const { project } = useProject();
  const projectId = project._id;

  const [wiki, setWiki] = useState<WikiData>({
    content: '',
    wikiSections: []
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
          wikiSections: existingWiki.wikiSections || []
        });

        // Extract IDs from populated objects
        const sectionIds = existingWiki.wikiSections?.map((ds: WikiSection) =>
          typeof ds.wikiSection === 'string'
            ? ds.wikiSection
            : ds.wikiSection._id
        ) || [];

        setSelectedWikiSections(sectionIds);
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

  // Rest of your component code remains the same...
  const buildHierarchy = (features: Feature[]): Feature[] => {
    return features.filter(f => !f.parent);
  };

  const getFeatureLevel = (featureId: string, level = 0): number => {
    const feature = features.find(f => f._id === featureId);
    if (!feature?.parent) return level;
    return getFeatureLevel(feature.parent, level + 1);
  };

  const getParentWikiSection = (featureId: string): string | undefined => {
    const feature = features.find(f => f._id === featureId);
    if (!feature?.parent) return undefined;
    const parentFeature = features.find(f => f._id === feature.parent);
    return parentFeature?.wikiSection;
  };

  const renderFeatureOption = (feature: Feature, level = 0): React.ReactNode[] => {
    const children = features.filter(f => f.parent === feature._id);
    const isSelected = selectedWikiSections.includes(feature.wikiSection!);

    const elements: React.ReactNode[] = [];

    if (feature.wikiSection) {
      elements.push(
        <div
          key={feature._id}
          style={{
            padding: '8px',
            margin: '4px 0',
            marginLeft: `${level * 20}px`,
            border: '1px solid #ccc',
            backgroundColor: isSelected ? '#f0f8ff' : 'white'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleWikiSectionToggle(feature)}
            />
            <span>{feature.title}</span>
          </label>
        </div>
      );
    }

    children.forEach(child => {
      elements.push(...renderFeatureOption(child, level + 1));
    });

    return elements;
  };

  const handleWikiSectionToggle = (feature: Feature) => {
    if (!feature.wikiSection) return;

    setSelectedWikiSections(prev => {
      if (prev.includes(feature.wikiSection!)) {
        return prev.filter(id => id !== feature.wikiSection);
      } else {
        return [...prev, feature.wikiSection!];
      }
    });
  };

  const buildWikiSections = (): WikiSection[] => {
    return selectedWikiSections.map((sectionId, index) => {
      const feature = features.find(f => f.wikiSection === sectionId);
      if (!feature) return null;

      return {
        wikiSection: sectionId,
        order: index,
        level: getFeatureLevel(feature._id),
        parentSection: getParentWikiSection(feature._id)
      };
    }).filter(Boolean) as WikiSection[];
  };

  const updateWikiSections = async () => {
    setLoading(true);
    try {
      const wikiSections = buildWikiSections();

      const response = await fetch(`/api/project/${projectId}/wiki/wiki-section`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wikiSections })
      });

      if (response.ok) {
        setWiki(prev => ({ ...prev, wikiSections }));
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
        body: JSON.stringify({
          content: wiki.content,
          project: projectId
        })
      });

      if (response.ok) {
        const savedWiki = await response.json();
        setWiki(prev => ({ ...prev, ...savedWiki }));
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

  // Drag and drop handlers remain the same...
  const handleDragStart = (wikiSectionId: string) => {
    setDraggedItem(wikiSectionId);
  };

  const canDropAtPosition = (draggedSectionId: string, targetIndex: number): boolean => {
    const draggedFeature = features.find(f => f.wikiSection === draggedSectionId);
    if (!draggedFeature) return false;

    const draggedParentSection = getParentWikiSection(draggedFeature._id);

    if (draggedParentSection) {
      const parentIndex = selectedWikiSections.indexOf(draggedParentSection);
      if (parentIndex === -1 || parentIndex >= targetIndex) {
        return false;
      }
    }

    return true;
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const currentIndex = selectedWikiSections.indexOf(draggedItem);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    if (!canDropAtPosition(draggedItem, targetIndex)) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...selectedWikiSections];

    const getChildrenSections = (parentSectionId: string): string[] => {
      return selectedWikiSections.filter(sectionId => {
        const feature = features.find(f => f.wikiSection === sectionId);
        return feature && getParentWikiSection(feature._id) === parentSectionId;
      });
    };

    const childrenSections = getChildrenSections(draggedItem);
    const itemsToMove = [draggedItem, ...childrenSections];
    const filteredOrder = newOrder.filter(id => !itemsToMove.includes(id));

    const adjustedTargetIndex = targetIndex > currentIndex
      ? targetIndex - itemsToMove.length
      : targetIndex;

    filteredOrder.splice(adjustedTargetIndex, 0, ...itemsToMove);

    setSelectedWikiSections(filteredOrder);
    setDraggedItem(null);
  };

  const renderSelectedFeature = (wikiSectionId: string, index: number) => {
    const feature = features.find(f => f.wikiSection === wikiSectionId);
    if (!feature) return null;

    const level = getFeatureLevel(feature._id);
    const isValidDropZone = !draggedItem || canDropAtPosition(draggedItem, index);

    return (
      <div
        key={wikiSectionId}
        draggable
        onDragStart={() => handleDragStart(wikiSectionId)}
        onDragOver={(e) => {
          if (isValidDropZone) e.preventDefault();
        }}
        onDrop={() => handleDrop(index)}
        style={{
          padding: '8px',
          margin: '4px 0',
          marginLeft: `${level * 20}px`,
          border: '1px solid #ccc',
          backgroundColor: draggedItem && !isValidDropZone ? '#ffebee' : '#f0f8ff',
          cursor: draggedItem && !isValidDropZone ? 'not-allowed' : 'move',
          opacity: draggedItem === wikiSectionId ? 0.5 : 1
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={true}
            onChange={() => handleWikiSectionToggle(feature)}
          />
          <span>{feature.title}</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
            #{index + 1} (Level {level})
          </span>
        </label>
      </div>
    );
  };

  if (wikiExists === null) {
    return <div>Loading...</div>;
  }

  const rootFeatures = buildHierarchy(features);

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
          <div style={{ flex: 1 }}>
            <h4>Available Sections</h4>
            {rootFeatures.map(feature => renderFeatureOption(feature))}
          </div>

          <div style={{ flex: 1 }}>
            <h4>Selected Sections (Ordered)</h4>
            {selectedWikiSections.map((wikiSectionId, index) =>
              renderSelectedFeature(wikiSectionId, index)
            )}
          </div>
        </div>

        <button onClick={updateWikiSections} disabled={loading}>
          Update Wiki Sections
        </button>
      </div>

      {wiki.wikiSections.map(section => (
      <WikiSectionEditor
        key={typeof section.wikiSection === 'string'
          ? section.wikiSection
          : section.wikiSection._id}
        projectId={projectId}
        sectionId={typeof section.wikiSection === 'string'
          ? section.wikiSection
          : section.wikiSection._id}
      />
    ))}
    </div>
  );
}