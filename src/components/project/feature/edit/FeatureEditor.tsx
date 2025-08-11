import React, { useState, useEffect } from 'react';
import DocumentationSectionEditor from "@/components/project/docs/section/DocumentationSectionEditor";
import WikiSectionEditor from "@/components/project/wiki/section/WikiSectionEditor";
import FeatureHierarchy from "@/components/project/feature/edit/FeatureHierarchy";
import FeatureDocumentation from "@/components/project/feature/edit/FeatureDocumentation";
import FeatureGitIntegration from "@/components/project/feature/edit/FeatureGitIntegration";
import FeatureBasicInfo from "@/components/project/feature/edit/FeatureBasicInfo";
import {Feature} from "@/types/project/features";


interface FeatureEditorProps {
  projectId: string;
  featureId: string;
}

export default function FeatureEditor({ projectId, featureId }: FeatureEditorProps) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState<Partial<Feature>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/features/${featureId}`);
        if (!response.ok) throw new Error('Failed to fetch feature');
        const data = await response.json();
        setFeature(data);
        setFormData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeature();
  }, [projectId, featureId]);

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
        setFeature(updated);
        setFormData(updated);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = () => {
    const { title, description, state } = formData;
    updateFeature(null, { title, description, state });
  };

  if (loading) return <div>Loading...</div>;
  if (!feature) return <div>Feature not found</div>;

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

        <DocumentationSectionEditor projectId={projectId} sectionId={feature.documentationSection!}/>
        <WikiSectionEditor projectId={projectId} sectionId={feature.wikiSection!}/>

    </div>
  );
}