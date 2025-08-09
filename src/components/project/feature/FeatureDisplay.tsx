import { useState, useEffect } from 'react';
import DocumentationSectionDisplay from "@/components/project/docs/section/DocumentationSectionDisplay";
import WikiSectionDisplay from "@/components/project/wiki/section/WikiSectionDisplay";

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
  docSection?: string;
  wikiSection?: string;
  createdAt: string;
  updatedAt: string;
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Features</h2>
      {features.map(feature => (
        <div key={feature._id}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
          <p>State: {feature.state}</p>
          <DocumentationSectionDisplay projectId={projectId} sectionId={feature.docSection!}/>
          <WikiSectionDisplay projectId={projectId} sectionId={feature.wikiSection!}/>
        </div>
      ))}
    </div>
  );
}