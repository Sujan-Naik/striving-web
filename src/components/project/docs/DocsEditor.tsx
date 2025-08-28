'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import DocsSectionEditor from './section/DocsSectionEditor';
import {IDocsSection} from "@/types/project/DocsSection";
import {IDocsSectionOrder, IDocs} from "@/types/project/Docs";
import {IFeature} from "@/types/project/Feature";
import {useDocs} from "@/context/DocsContext";
import {useFeatures} from "@/context/FeatureContext";
import {HeadedButton, HeadedInput, HeadedTextArea, VariantEnum} from "headed-ui";

export default function DocsEditor() {
const project = useProject()!;
const projectId = project._id;

const [docs, setDocs] = useState<IDocs>(useDocs().docs);
const [features, setFeatures] = useState<IFeature[]>(useFeatures());
const [selectedDocsSections, setSelectedDocsSections] = useState<string[]>(docs.docsSections.map(value => value.docsSection._id));
const [loading, setLoading] = useState(false);
const [docsExists, setDocsExists] = useState<boolean>(true);
const [draggedItem, setDraggedItem] = useState<string | null>(null);

const buildHierarchy = (features: IFeature[]): IFeature[] => {
  return features.filter(f => !f.parent);
};

const getFeatureLevel = (featureId: string, level = 0): number => {
  const feature = features.find(f => f._id === featureId);
  if (!feature?.parent) return level;
  return getFeatureLevel(feature.parent, level + 1);
};

const getParentDocsSection = (featureId: string): IDocsSection | undefined => {
  const feature = features.find(f => f._id === featureId);
  if (!feature?.parent) return undefined;
  const parentFeature = features.find(f => f._id === feature.parent);
  return parentFeature?.docsSection;
};

const renderFeatureOption = (feature: IFeature, level = 0): React.ReactNode => {
const children = features.filter(f => f.parent === feature._id);
const isSelected = selectedDocsSections.includes(feature.docsSection._id!);

return (
  <React.Fragment key={feature._id}>
    {feature.docsSection && (
      <div
        style={{
          padding: '8px',
          margin: '4px 0',
          marginLeft: `${level * 20}px`,
          border: '1px solid #ccc',
          backgroundColor: isSelected ? '#f0f8ff' : 'white'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeadedInput width={"100%"} variant={VariantEnum.Outline}
            type="checkbox"
            checked={isSelected}
            onChange={() => handleDocsSectionToggle(feature)}
          />
          <span>{feature.title}</span>
        </label>
      </div>
    )}
    {children.map(child => renderFeatureOption(child, level + 1))}
  </React.Fragment>
);
};

const handleDocsSectionToggle = (feature: IFeature) => {
  if (!feature.docsSection) return;

  const sectionId = feature.docsSection._id!;

  setSelectedDocsSections(prev => {
    if (prev.includes(sectionId)) {
      // Deselecting: remove this section and all its children
      const childSections = getChildSections(feature._id);
      return prev.filter(id => id !== sectionId && !childSections.includes(id));
    } else {
      // Selecting: auto-select parent hierarchy
      let newSections = [...prev];

      // Collect all required parents
      const requiredParents = getRequiredParents(feature._id);

      // Add missing parents first
      requiredParents.forEach(parentId => {
        if (!newSections.includes(parentId)) {
          const parentFeature = features.find(f => f.docsSection._id === parentId);
          if (parentFeature) {
            const insertIndex = findInsertionIndex(newSections, parentFeature);
            newSections.splice(insertIndex, 0, parentId);
          }
        }
      });

      // Add the selected section
      const insertIndex = findInsertionIndex(newSections, feature);
      newSections.splice(insertIndex, 0, sectionId);

      return newSections;
    }
  });
};

const getRequiredParents = (featureId: string): string[] => {
  const parents: string[] = [];
  let currentFeature = features.find(f => f._id === featureId);

  while (currentFeature?.parent) {
    const parentFeature = features.find(f => f._id === currentFeature!.parent);
    if (parentFeature?.docsSection) {
      parents.unshift(parentFeature.docsSection._id!);
    }
    currentFeature = parentFeature;
  }

  return parents;
};


const findInsertionIndex = (currentSections: string[], newFeature: IFeature): number => {
  const newLevel = getFeatureLevel(newFeature._id);
  const newParentSection = getParentDocsSection(newFeature._id);
  const newParentId = newParentSection?._id || null;

  // If it's a root level item, find the last root level item and insert after it
 if (newLevel === 0) {
  // Find the last root item and its children, then insert after
  let insertAfterIndex = 0;
  for (let i = 0; i < currentSections.length; i++) {
    const feature = features.find(f => f.docsSection._id === currentSections[i]);
    if (feature && getFeatureLevel(feature._id) === 0) {
      // Find end of this root's children
      let j = i + 1;
      while (j < currentSections.length) {
        const childFeature = features.find(f => f.docsSection._id === currentSections[j]);
        if (!childFeature || getFeatureLevel(childFeature._id) === 0) break;
        j++;
      }
      insertAfterIndex = j;
    }
  }
  return insertAfterIndex;
}

  // For non-root items, find the correct position within their parent's children
  if (newParentId) {
    const parentIndex = currentSections.indexOf(newParentId);
    if (parentIndex !== -1) {
      // Find the end of this parent's children section
      let insertIndex = parentIndex + 1;
      for (let i = parentIndex + 1; i < currentSections.length; i++) {
        const feature = features.find(f => f.docsSection._id === currentSections[i]);
        if (!feature) continue;

        const featureParent = getParentDocsSection(feature._id);
        const featureParentId = featureParent?._id || null;

        // If we've moved beyond this parent's children, stop
        if (featureParentId !== newParentId && getFeatureLevel(feature._id) <= newLevel) {
          break;
        }
        insertIndex = i + 1;
      }
      return insertIndex;
    }
  }

  return currentSections.length;
};

const getChildSections = (parentFeatureId: string): string[] => {
const childFeatures = features.filter(f => f.parent === parentFeatureId);
let childSections: string[] = [];

childFeatures.forEach(child => {
  if (child.docsSection) {
    childSections.push(child.docsSection._id!);
    childSections = [...childSections, ...getChildSections(child._id)];
  }
});

return childSections;
};

const buildDocsSections = (): IDocsSectionOrder[] => {
return selectedDocsSections.map((sectionId, index) => {
  const feature = features.find(f => f.docsSection._id === sectionId)!;
  const parentSection = getParentDocsSection(feature._id);

  return {
    docsSection: feature.docsSection,
    order: index,
    level: getFeatureLevel(feature._id),
    parentSection: parentSection || undefined
  };
});
};

const updateDocsSections = async () => {
  setLoading(true);
  try {
    const docsSections = buildDocsSections();
    const response = await fetch(`/api/project/${projectId}/docs/docs-section`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docsSections })
    });


    if (response.ok) {
      setDocs(prev => ({ ...prev, docsSections }));
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

    const response = await fetch(`/api/project/${projectId}/docs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: docs.content,
        project: projectId
      })
    });

    if (response.ok) {
      const savedDocs = await response.json();
      setDocs(prev => ({ ...prev, ...savedDocs }));
      setDocsExists(true);
      alert(`Docs updated successfully`);
    }
  } catch (error) {
    console.error('Error saving docs:', error);
  } finally {
    setLoading(false);
  }
};

const handleDragStart = (docsSectionId: string) => {
setDraggedItem(docsSectionId);
};

const canDropAtPosition = (draggedSectionId: string, targetIndex: number): boolean => {
  const draggedFeature = features.find(f => f.docsSection._id === draggedSectionId);
  if (!draggedFeature) return false;

  const draggedParentId = getParentDocsSection(draggedFeature._id)?._id || null;

  if (targetIndex >= selectedDocsSections.length) return true;

  const targetSectionId = selectedDocsSections[targetIndex];
  const targetFeature = features.find(f => f.docsSection._id === targetSectionId);
  if (!targetFeature) return false;

  const targetParentId = getParentDocsSection(targetFeature._id)?._id || null;

  return draggedParentId === targetParentId;
};


const handleDrop = (targetIndex: number) => {
  if (!draggedItem) return;

  const currentIndex = selectedDocsSections.indexOf(draggedItem);
  if (currentIndex === -1 || currentIndex === targetIndex) return;

  if (!canDropAtPosition(draggedItem, targetIndex)) {
    setDraggedItem(null);
    return;
  }

  const newOrder = [...selectedDocsSections];
  const [movedItem] = newOrder.splice(currentIndex, 1);
  const adjustedTargetIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
  newOrder.splice(adjustedTargetIndex, 0, movedItem);

  setSelectedDocsSections(newOrder);
  setDraggedItem(null);
};



const renderSelectedFeature = (docsSectionId: string, index: number) => {
const feature = features.find(f => f.docsSection._id === docsSectionId);
if (!feature) return null;

const level = getFeatureLevel(feature._id);
const isValidDropZone = !draggedItem || canDropAtPosition(draggedItem, index);
const isDragging = draggedItem === docsSectionId;

console.log(docsSectionId)
return (
  <div
    key={docsSectionId}
    draggable
    onDragStart={() => handleDragStart(docsSectionId)}
    onDragOver={(e) => isValidDropZone && e.preventDefault()}
    onDrop={() => handleDrop(index)}
    className={`feature-item ${!isValidDropZone ? 'invalid-drop' : ''} ${isDragging ? 'dragging' : ''}`}
    style={{
      marginLeft: `${level * 20}px`,
      opacity: isDragging ? 0.5 : 1
    }}
  >
    <label>
      <HeadedInput width={"100%"} variant={VariantEnum.Outline}
        type="checkbox"
        checked
        onChange={() => handleDocsSectionToggle(feature)}
      />
      <span>{feature.title}</span>
      <span className="feature-meta">
        #{index + 1} (Level {level})
      </span>
    </label>
  </div>
);
};

if (docsExists === null) {
  // return <div>Loading...</div>;
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
      <HeadedTextArea width={"100%"} variant={VariantEnum.Outline}
        placeholder="Docs Content"
        value={docs.content}
        onChange={(e) => setDocs({ ...docs, content: e.target.value })}
        rows={15}
      />
      <HeadedButton variant={VariantEnum.Outline} type="submit" disabled={loading}>
        {'Update Docs'}
      </HeadedButton>
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
          {selectedDocsSections.map((docsSectionId, index) =>
            renderSelectedFeature(docsSectionId, index)
          )}
        </div>
      </div>

      <HeadedButton variant={VariantEnum.Outline} onClick={updateDocsSections} disabled={loading}>
        Update Docs Sections
      </HeadedButton>
    </div>

    {docs.docsSections.map(section => (
      <DocsSectionEditor
        key={section.docsSection._id}
        projectId={projectId}
        docsSection={section.docsSection}
      />
    ))}
  </div>
);
}