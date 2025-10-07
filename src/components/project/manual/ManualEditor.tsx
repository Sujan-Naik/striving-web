'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import {IManualSection} from "@/types/project/ManualSection";
import {IManualSectionOrder, IManual} from "@/types/project/Manual";
import {IFeature} from "@/types/project/Feature";
import {useManual} from "@/context/ManualContext";
import {useFeatures} from "@/context/FeatureContext";
import {HeadedButton, HeadedCarousel, HeadedInput, HeadedTextArea, VariantEnum} from "headed-ui";
import ManualSectionEditor from "@/components/project/manual/section/ManualSectionEditor";

export default function ManualEditor() {
  const { project, refreshProject } = useProject()!;
const projectId = project._id;

const [manual, setManual] = useState<IManual>(useManual().manual);
const [features, setFeatures] = useState<IFeature[]>(useFeatures());
const [selectedManualSections, setSelectedManualSections] = useState<string[]>(manual.manualSections.map(value => value.manualSection._id));
const [loading, setLoading] = useState(false);
const [manualExists, setManualExists] = useState<boolean>(true);
const [draggedItem, setDraggedItem] = useState<string | null>(null);

const buildHierarchy = (features: IFeature[]): IFeature[] => {
  return features.filter(f => !f.parent);
};

const getFeatureLevel = (featureId: string, level = 0): number => {
  const feature = features.find(f => f._id === featureId);
  if (!feature?.parent) return level;
  return getFeatureLevel(feature.parent, level + 1);
};

const getParentManualSection = (featureId: string): IManualSection | undefined => {
  const feature = features.find(f => f._id === featureId);
  if (!feature?.parent) return undefined;
  const parentFeature = features.find(f => f._id === feature.parent);
  return parentFeature?.manualSection;
};

const renderFeatureOption = (feature: IFeature, level = 0): React.ReactNode => {
const children = features.filter(f => f.parent === feature._id);
const isSelected = selectedManualSections.includes(feature.manualSection._id!);

return (
  <React.Fragment key={feature._id}>
    {feature.manualSection && (
      <div
        style={{
          padding: '8px',
          margin: '4px 0',
          marginLeft: `${level * 20}px`,
          border: '1px solid #ccc',
          backgroundColor: isSelected ? 'var(--highlight)' : 'var(--hover)',
          display: 'block'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeadedInput width={"100%"} variant={VariantEnum.Outline}
            type="checkbox"
            checked={isSelected}
            onChange={() => handleManualSectionToggle(feature)}
          />
          <span>{feature.title}</span>
        </label>
      </div>
    )}
    {children.map(child => renderFeatureOption(child, level + 1))}
  </React.Fragment>
);
};

const handleManualSectionToggle = (feature: IFeature) => {
  if (!feature.manualSection) return;

  const sectionId = feature.manualSection._id!;

  setSelectedManualSections(prev => {
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
          const parentFeature = features.find(f => f.manualSection._id === parentId);
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
    if (parentFeature?.manualSection) {
      parents.unshift(parentFeature.manualSection._id!);
    }
    currentFeature = parentFeature;
  }

  return parents;
};


const findInsertionIndex = (currentSections: string[], newFeature: IFeature): number => {
  const newLevel = getFeatureLevel(newFeature._id);
  const newParentSection = getParentManualSection(newFeature._id);
  const newParentId = newParentSection?._id || null;

  // If it's a root level item, find the last root level item and insert after it
 if (newLevel === 0) {
  // Find the last root item and its children, then insert after
  let insertAfterIndex = 0;
  for (let i = 0; i < currentSections.length; i++) {
    const feature = features.find(f => f.manualSection._id === currentSections[i]);
    if (feature && getFeatureLevel(feature._id) === 0) {
      // Find end of this root's children
      let j = i + 1;
      while (j < currentSections.length) {
        const childFeature = features.find(f => f.manualSection._id === currentSections[j]);
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
        const feature = features.find(f => f.manualSection._id === currentSections[i]);
        if (!feature) continue;

        const featureParent = getParentManualSection(feature._id);
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
  if (child.manualSection) {
    childSections.push(child.manualSection._id!);
    childSections = [...childSections, ...getChildSections(child._id)];
  }
});

return childSections;
};

const buildManualSections = (): IManualSectionOrder[] => {
return selectedManualSections.map((sectionId, index) => {
  const feature = features.find(f => f.manualSection._id === sectionId)!;
  const parentSection = getParentManualSection(feature._id);

  return {
    manualSection: feature.manualSection,
    order: index,
    level: getFeatureLevel(feature._id),
    parentSection: parentSection || undefined
  };
});
};

const updateManualSections = async () => {
  setLoading(true);
  try {
    const manualSections = buildManualSections();
    const response = await fetch(`/api/project/${projectId}/manual/${manual._id}/manual-section`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manualSections })
    });


    if (response.ok) {
      setManual(prev => ({ ...prev, manualSections }));
      alert('Manual sections updated successfully');
    }
  } catch (error) {
    console.error('Error updating manual sections:', error);
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch(`/api/project/${projectId}/manual`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: manual.content,
        project: projectId
      })
    });

    if (response.ok) {
      const savedManual = await response.json();
      setManual(prev => ({ ...prev, ...savedManual }));
      setManualExists(true);
      alert(`Manual updated successfully`);
    }
  } catch (error) {
    console.error('Error saving manual:', error);
  } finally {
    setLoading(false);
  }
};

const handleDragStart = (manualSectionId: string) => {
setDraggedItem(manualSectionId);
};

const canDropAtPosition = (draggedSectionId: string, targetIndex: number): boolean => {
  const draggedFeature = features.find(f => f.manualSection._id === draggedSectionId);
  if (!draggedFeature) return false;

  const draggedParentId = getParentManualSection(draggedFeature._id)?._id || null;

  if (targetIndex >= selectedManualSections.length) return true;

  const targetSectionId = selectedManualSections[targetIndex];
  const targetFeature = features.find(f => f.manualSection._id === targetSectionId);
  if (!targetFeature) return false;

  const targetParentId = getParentManualSection(targetFeature._id)?._id || null;

  return draggedParentId === targetParentId;
};


const handleDrop = (targetIndex: number) => {
  if (!draggedItem) return;

  const currentIndex = selectedManualSections.indexOf(draggedItem);
  if (currentIndex === -1 || currentIndex === targetIndex) return;

  if (!canDropAtPosition(draggedItem, targetIndex)) {
    setDraggedItem(null);
    return;
  }

  const newOrder = [...selectedManualSections];
  const [movedItem] = newOrder.splice(currentIndex, 1);
  const adjustedTargetIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;

  // Get all children of the moved item
  const movedFeature = features.find(f => f.manualSection._id === movedItem);
  const childSections = movedFeature ? getChildSections(movedFeature._id) : [];

  // Remove all children from their current positions
  const childrenToMove = childSections.filter(childId => newOrder.includes(childId));
  childrenToMove.forEach(childId => {
    const childIndex = newOrder.indexOf(childId);
    if (childIndex !== -1) {
      newOrder.splice(childIndex, 1);
    }
  });

  // Insert the moved item at the target position
  newOrder.splice(adjustedTargetIndex, 0, movedItem);

  // Insert all children immediately after the moved item
  childrenToMove.forEach((childId, index) => {
    newOrder.splice(adjustedTargetIndex + 1 + index, 0, childId);
  });

  setSelectedManualSections(newOrder);
  setDraggedItem(null);
};



const renderSelectedFeature = (manualSectionId: string, index: number, editor: boolean) => {
const feature = features.find(f => f.manualSection._id === manualSectionId);
if (!feature) return null;

const level = getFeatureLevel(feature._id);
const isValidDropZone = !draggedItem || canDropAtPosition(draggedItem, index);
const isDragging = draggedItem === manualSectionId;

if (editor) {
  return (

      <div
          key={manualSectionId}
      >
        <label>
          <ManualSectionEditor
              key={feature.manualSection._id}
              projectId={projectId}
              manualSection={feature.manualSection}
              onFeatureUpdate={refreshProject}
          />
        </label>
      </div>
  )
}
else {
  return (
      <div
          key={manualSectionId}
          draggable
          onDragStart={() => handleDragStart(manualSectionId)}
          onDragOver={(e) => isValidDropZone && e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className={`feature-item ${!isValidDropZone ? 'invalid-drop' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{
            marginLeft: `${level * 20}px`,
            opacity: isDragging ? 0.5 : 1,
            display: 'block'
          }}
      >
      <HeadedInput width={"100%"} variant={VariantEnum.Outline}
        type="checkbox"
        checked
        onChange={() => handleManualSectionToggle(feature)}
      />
      <span>{feature.title}</span>
      <span className="feature-meta">
        #{index + 1} (Level {level})
      </span>
        </div>
  )
  }
}

if (manualExists === null) {
  // return <div>Loading...</div>;
}

const rootFeatures = buildHierarchy(features);
return (
  <div>
    {!manualExists && (
      <div>
        <h3>No manual found for this project</h3>
        <p>Create a new manual to get started.</p>
      </div>
    )}

    <form onSubmit={handleSubmit} className={'center-column'}>
      <HeadedTextArea width={"100%"} variant={VariantEnum.Outline}
        placeholder="Manual Content"
        value={manual.content}
        onChange={(e) => setManual({ ...manual, content: e.target.value })}
                      markdown={true} height={'auto'}
        rows={15}
      />
      <HeadedButton variant={VariantEnum.Outline} type="submit" disabled={loading}>
        {'Update Manual'}
      </HeadedButton>
    </form>

    <div className={'center-column'}>
      <h3>Select & Order Manual Sections</h3>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h4>Available Sections</h4>
          {rootFeatures.map(feature => renderFeatureOption(feature))}
        </div>

        <div style={{ flex: 1 }}>
          <h4>Selected Sections (Ordered)</h4>
          {selectedManualSections.map((manualSectionId, index) =>
            renderSelectedFeature(manualSectionId, index, false)
          )}
        </div>
      </div>

      <HeadedButton variant={VariantEnum.Outline} onClick={updateManualSections} disabled={loading}>
        Update Manual Sections
      </HeadedButton>
    </div>

                <HeadedCarousel variant={VariantEnum.Outline}>

    {selectedManualSections.map((manualSectionId, index) =>
            renderSelectedFeature(manualSectionId, index, true)
          )}
                </HeadedCarousel>
  </div>
);
}