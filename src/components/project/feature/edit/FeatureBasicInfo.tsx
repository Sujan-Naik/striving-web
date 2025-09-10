// components/FeatureBasicInfo.tsx
import React, { useState } from 'react';
import { IFeature } from '@/types/project/Feature';
import {HeadedButton, HeadedInput, HeadedTextArea, VariantEnum} from "headed-ui";

interface FeatureBasicInfoProps {
  feature: IFeature;
  onUpdate: (data: Partial<IFeature>) => void;
  saving: boolean;
}

export default function FeatureBasicInfo({ feature, onUpdate, saving }: FeatureBasicInfoProps) {
  const [formData, setFormData] = useState({
    title: feature.title,
    description: feature.description,
    state: feature.state
  });

  return (
    <div className={"center-column"} style={{width: '100%'}}>
      <h3>Basic Information</h3>
      <HeadedInput width={"100%"} variant={VariantEnum.Outline}
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        disabled={saving}
        placeholder="Feature title"
      />
      <HeadedTextArea width={"100%"} variant={VariantEnum.Outline}
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        disabled={saving}
        placeholder="Feature description"
                      markdown={true}
      />
      <select
        value={formData.state}
        onChange={(e) => {
          const newState = e.target.value as IFeature['state'];
          setFormData({...formData, state: newState});
          onUpdate({ state: newState });
        }}
        disabled={saving}
      >
        <option value="PLANNED">Planned</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
      <HeadedButton variant={VariantEnum.Outline} onClick={() => onUpdate(formData)} disabled={saving}>
        Update Basic Info
      </HeadedButton>
    </div>
  );
}