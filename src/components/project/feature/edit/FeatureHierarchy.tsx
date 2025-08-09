// components/FeatureHierarchy.tsx
import React, { useState, useEffect } from 'react';
import {Feature} from "@/types/features";

interface FeatureHierarchyProps {
  projectId: string;
  featureId: string;
  parent?: string;
  children: string[];
  onUpdate: (endpoint: string, data: any) => void;
}

export default function FeatureHierarchy({
  projectId,
  featureId,
  parent,
  children,
  onUpdate
}: FeatureHierarchyProps) {
  const [parentFeature, setParentFeature] = useState<Feature | null>(null);
  const [childFeatures, setChildFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    if (parent) fetchParentFeature();
  }, [parent]);

  useEffect(() => {
    if (children.length) fetchChildFeatures();
  }, [children]);

  const fetchParentFeature = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/features/${parent}`);
      if (response.ok) {
        const data = await response.json();
        setParentFeature(data);
      }
    } catch (err) {
      console.error('Failed to fetch parent feature:', err);
    }
  };

  const fetchChildFeatures = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/features/batch?ids=${children.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setChildFeatures(data);
      }
    } catch (err) {
      console.error('Failed to fetch child features:', err);
    }
  };

  return (
    <div>
      <h3>Feature Hierarchy</h3>

      {parentFeature && (
        <div>
          <h4>Parent Feature</h4>
          <span>{parentFeature.title}</span>
          <button onClick={() => onUpdate('parent/remove', {})}>
            Remove Parent
          </button>
        </div>
      )}

      <div>
        <h4>Child Features</h4>
        {childFeatures.map(child => (
          <div key={child._id}>
            <span>{child.title}</span>
            <button onClick={() => onUpdate('children/remove', { childId: child._id })}>
              Remove
            </button>
          </div>
        ))}
        <input
          placeholder="Add child feature ID"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const target = e.currentTarget;
              onUpdate('children', { childId: target.value });
              target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}