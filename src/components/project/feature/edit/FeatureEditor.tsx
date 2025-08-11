import React, { useState, useEffect } from 'react';
import DocsSectionEditor from "@/components/project/docs/section/DocsSectionEditor";
import ManualSectionEditor from "@/components/project/manual/section/ManualSectionEditor";
import FeatureHierarchy from "@/components/project/feature/edit/FeatureHierarchy";
import FeatureDocs from "@/components/project/feature/edit/FeatureDocs";
import FeatureGitIntegration from "@/components/project/feature/edit/FeatureGitIntegration";
import FeatureBasicInfo from "@/components/project/feature/edit/FeatureBasicInfo";
import {IFeature} from "@/types/project/Feature";



export default function FeatureEditor({projectId, feature} : {projectId: string, feature: IFeature}) {

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const featureId = feature._id

  const updateFeature = async (endpoint: string | null, data: any) => {
    setSaving(true);
    try {
      const url = endpoint
        ? `/api/project/${projectId}/features/${featureId}/${endpoint}`
        : `/api/project/${projectId}/features/${featureId}`;

      const response = await fetch(url, {
        method: endpoint ? 'PUT' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };


   return (
    <div>
      <h2>Edit Feature: {feature.title}</h2>
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <FeatureBasicInfo
        feature={feature}
        onUpdate={(data) => updateFeature(null, data)}
        saving={saving}
      />

      <FeatureGitIntegration
        projectId={projectId}
        featureId={featureId}
        commitShas={feature.commitShas}
        pullRequestNumbers={feature.pullRequestNumbers}
        onUpdate={updateFeature}
      />

      <FeatureHierarchy
        projectId={projectId}
        featureId={featureId}
        parent={feature.parent}
        children={feature.children}
        onUpdate={updateFeature}
      />

        <DocsSectionEditor projectId={projectId} docsSection={feature.docsSection} />
        <ManualSectionEditor projectId={projectId} manualSection={feature.manualSection} />

    </div>
  );
}