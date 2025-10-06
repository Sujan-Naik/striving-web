import {JSX, useEffect, useState} from 'react';
import {HeadedCarousel, HeadedTabs, VariantEnum} from "headed-ui";
import {IFeature} from "@/types/project/Feature";
import FeatureDisplaySingle from "@/components/project/feature/FeatureDisplaySingle";


interface FeatureDisplayProps {
  projectId: string;
}

export default function FeatureDisplay({ projectId }: FeatureDisplayProps) {
  const [features, setFeatures] = useState<IFeature[]>([]);
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

  const buildHierarchy = (features: IFeature[]): IFeature[] => {
    const featureMap = new Map(features.map(f => [f._id, f]));
    return features.filter(f => !f.parent);
  };

  const renderFeature = (feature: IFeature, level = 0): JSX.Element => {
    const children = features.filter(f => f.parent === feature._id);

    return (
      <div key={feature._id} style={{ marginLeft: `${level * 20}px`, marginBottom: '1rem', width: '100%'}} >
        <FeatureDisplaySingle feature={feature}/>
        {children.map(child => renderFeature(child, level + 1))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const rootFeatures = buildHierarchy(features);

  return (
    <>
            <HeadedTabs tabs={rootFeatures.map(value => value.title)} >

      {rootFeatures.map(feature => renderFeature(feature))}
            </HeadedTabs>
    </>
  );
}