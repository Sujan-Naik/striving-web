// components/FeatureBasicInfo.tsx
import React, { useState } from 'react';
import { Feature } from '@/types/project/features';

interface FeatureBasicInfoProps {
  feature: Feature;
  onUpdate: (data: Partial<Feature>) => void;
  saving: boolean;
}

export default function FeatureBasicInfo({ feature, onUpdate, saving }: FeatureBasicInfoProps) {
  const [formData, setFormData] = useState({
    title: feature.title,
    description: feature.description,
    state: feature.state
  });

  return (
    <div>
      <h3>Basic Information</h3>
      <input
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        disabled={saving}
        placeholder="Feature title"
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        disabled={saving}
        placeholder="Feature description"
      />
      <select
        value={formData.state}
        onChange={(e) => {
          const newState = e.target.value as Feature['state'];
          setFormData({...formData, state: newState});
          onUpdate({ state: newState });
        }}
        disabled={saving}
      >
        <option value="PLANNED">Planned</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
      <button onClick={() => onUpdate(formData)} disabled={saving}>
        Update Basic Info
      </button>
    </div>
  );
}