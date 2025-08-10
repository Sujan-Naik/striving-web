import {useState, useEffect, JSX} from 'react';
import DocumentationSectionDisplay from "@/components/project/docs/section/DocumentationSectionDisplay";
import WikiSectionDisplay from "@/components/project/wiki/section/WikiSectionDisplay";
import {HeadedTabs} from "headed-ui";
import {Types} from "mongoose";

interface Feature {
  _id: string;
  title: string;
  description: string;
  state: string;
  assignedUsers: string[];
  commitShas: string[];
  pullRequestNumbers: number[];
  parent?: string;
  children: string[];
  documentationSection?: DocumentationSection;
  wikiSection?: WikiSection;
  createdAt: string;
  updatedAt: string;
}

interface WikiSection{
  _id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentationSection{
  _id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}


interface FeatureDisplayProps {
  projectId: string;
}

export default function FeatureDisplay({ projectId }: FeatureDisplayProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/features`);
        if (!response.ok) throw new Error('Failed to fetch features');
        const data = await response.json();
        setFeatures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [projectId]);

  const buildHierarchy = (features: Feature[]): Feature[] => {
    const featureMap = new Map(features.map(f => [f._id, f]));
    return features.filter(f => !f.parent);
  };

  const renderFeature = (feature: Feature, level = 0): JSX.Element => {
    const children = features.filter(f => f.parent === feature._id);

    return (
      <div key={feature._id} style={{ marginLeft: `${level * 20}px`, marginBottom: '1rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>{feature.title} {feature.children.length > 0 && '(Parent)'}</h3>
          <p>{feature.description}</p>
          <p>State: {feature.state}</p>
          <DocumentationSectionDisplay section={feature.documentationSection!}/>
          <WikiSectionDisplay section={feature.wikiSection!}/>
        </div>
        {children.map(child => renderFeature(child, level + 1))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const rootFeatures = buildHierarchy(features);

  return (
    <div>
      <h2>Features</h2>
            <HeadedTabs tabs={rootFeatures.map(value => value.title)} >

      {rootFeatures.map(feature => renderFeature(feature))}
            </HeadedTabs>
    </div>
  );
}