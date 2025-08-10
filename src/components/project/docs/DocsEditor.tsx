'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import DocumentationSectionEditor from './section/DocumentationSectionEditor';

interface PopulatedDocsSection {
  _id: string;
  title: string;
  content: string;
}

interface DocsSection {
  documentationSection: string | PopulatedDocsSection; // Can be ID or populated object
  order: number;
  level: number;
  parentSection?: string;
}

interface DocsData {
  _id?: string;
  content: string;
  documentationSections: DocsSection[];
}

interface Feature {
  _id: string;
  title: string;
  parent?: string;
  children: string[];
  documentationSection?: string;
}

export default function DocsEditor() {
  const project  = useProject()!;
  const projectId = project._id;

  const [docs, setDocs] = useState<DocsData>({
    content: '',
    documentationSections: []
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
          documentationSections: existingDocs.documentationSections || []
        });

        // Extract IDs from populated objects
        const sectionIds = existingDocs.documentationSections?.map((ds: DocsSection) =>
          typeof ds.documentationSection === 'string'
            ? ds.documentationSection
            : ds.documentationSection._id
        ) || [];

        setSelectedDocumentationSections(sectionIds);
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

  // Rest of your component code remains the same...
  const buildHierarchy = (features: Feature[]): Feature[] => {
    return features.filter(f => !f.parent);
  };

  const getFeatureLevel = (featureId: string, level = 0): number => {
    const feature = features.find(f => f._id === featureId);
    if (!feature?.parent) return level;
    return getFeatureLevel(feature.parent, level + 1);
  };

  const getParentDocumentationSection = (featureId: string): string | undefined => {
    const feature = features.find(f => f._id === featureId);
    if (!feature?.parent) return undefined;
    const parentFeature = features.find(f => f._id === feature.parent);
    return parentFeature?.documentationSection;
  };

  const renderFeatureOption = (feature: Feature, level = 0): React.ReactNode[] => {
    const children = features.filter(f => f.parent === feature._id);
    const isSelected = selectedDocumentationSections.includes(feature.documentationSection!);

    const elements: React.ReactNode[] = [];

    if (feature.documentationSection) {
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
              onChange={() => handleDocumentationSectionToggle(feature)}
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

  const handleDocumentationSectionToggle = (feature: Feature) => {
    if (!feature.documentationSection) return;

    setSelectedDocumentationSections(prev => {
      if (prev.includes(feature.documentationSection!)) {
        return prev.filter(id => id !== feature.documentationSection);
      } else {
        return [...prev, feature.documentationSection!];
      }
    });
  };

  const buildDocumentationSections = (): DocsSection[] => {
    return selectedDocumentationSections.map((sectionId, index) => {
      const feature = features.find(f => f.documentationSection === sectionId);
      if (!feature) return null;

      return {
        documentationSection: sectionId,
        order: index,
        level: getFeatureLevel(feature._id),
        parentSection: getParentDocumentationSection(feature._id)
      };
    }).filter(Boolean) as DocsSection[];
  };

  const updateDocumentationSections = async () => {
    setLoading(true);
    try {
      const documentationSections = buildDocumentationSections();

      const response = await fetch(`/api/project/${projectId}/docs/documentation-section`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentationSections })
      });

      if (response.ok) {
        setDocs(prev => ({ ...prev, documentationSections }));
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
        body: JSON.stringify({
          content: docs.content,
          project: projectId
        })
      });

      if (response.ok) {
        const savedDocs = await response.json();
        setDocs(prev => ({ ...prev, ...savedDocs }));
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

  // Drag and drop handlers remain the same...
  const handleDragStart = (documentationSectionId: string) => {
    setDraggedItem(documentationSectionId);
  };

  const canDropAtPosition = (draggedSectionId: string, targetIndex: number): boolean => {
    const draggedFeature = features.find(f => f.documentationSection === draggedSectionId);
    if (!draggedFeature) return false;

    const draggedParentSection = getParentDocumentationSection(draggedFeature._id);

    if (draggedParentSection) {
      const parentIndex = selectedDocumentationSections.indexOf(draggedParentSection);
      if (parentIndex === -1 || parentIndex >= targetIndex) {
        return false;
      }
    }

    return true;
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const currentIndex = selectedDocumentationSections.indexOf(draggedItem);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    if (!canDropAtPosition(draggedItem, targetIndex)) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...selectedDocumentationSections];

    const getChildrenSections = (parentSectionId: string): string[] => {
      return selectedDocumentationSections.filter(sectionId => {
        const feature = features.find(f => f.documentationSection === sectionId);
        return feature && getParentDocumentationSection(feature._id) === parentSectionId;
      });
    };

    const childrenSections = getChildrenSections(draggedItem);
    const itemsToMove = [draggedItem, ...childrenSections];
    const filteredOrder = newOrder.filter(id => !itemsToMove.includes(id));

    const adjustedTargetIndex = targetIndex > currentIndex
      ? targetIndex - itemsToMove.length
      : targetIndex;

    filteredOrder.splice(adjustedTargetIndex, 0, ...itemsToMove);

    setSelectedDocumentationSections(filteredOrder);
    setDraggedItem(null);
  };

  const renderSelectedFeature = (documentationSectionId: string, index: number) => {
    const feature = features.find(f => f.documentationSection === documentationSectionId);
    if (!feature) return null;

    const level = getFeatureLevel(feature._id);
    const isValidDropZone = !draggedItem || canDropAtPosition(draggedItem, index);

    return (
      <div
        key={documentationSectionId}
        draggable
        onDragStart={() => handleDragStart(documentationSectionId)}
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
          opacity: draggedItem === documentationSectionId ? 0.5 : 1
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={true}
            onChange={() => handleDocumentationSectionToggle(feature)}
          />
          <span>{feature.title}</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
            #{index + 1} (Level {level})
          </span>
        </label>
      </div>
    );
  };

  if (docsExists === null) {
    return <div>Loading...</div>;
  }

  const rootFeatures = buildHierarchy(features);

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
          <div style={{ flex: 1 }}>
            <h4>Available Sections</h4>
            {rootFeatures.map(feature => renderFeatureOption(feature))}
          </div>

          <div style={{ flex: 1 }}>
            <h4>Selected Sections (Ordered)</h4>
            {selectedDocumentationSections.map((documentationSectionId, index) =>
              renderSelectedFeature(documentationSectionId, index)
            )}
          </div>
        </div>

        <button onClick={updateDocumentationSections} disabled={loading}>
          Update Docs Sections
        </button>
      </div>

      {docs.documentationSections.map(section => (
      <DocumentationSectionEditor
        key={typeof section.documentationSection === 'string'
          ? section.documentationSection
          : section.documentationSection._id}
        projectId={projectId}
        sectionId={typeof section.documentationSection === 'string'
          ? section.documentationSection
          : section.documentationSection._id}
      />
    ))}
    </div>
  );
}