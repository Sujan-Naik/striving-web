'use client'
import {useEffect, useState} from "react";
import {useProject} from "@/context/ProjectContext";
import FeatureEditor from "@/components/project/feature/edit/FeatureEditor";
import FeatureCreate from "@/components/project/feature/FeatureCreate";
import {AccordionItem, HeadedAccordion, HeadedTabs, VariantEnum} from "headed-ui";

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
  documentationSection?: string;
  wikiSection?: string;
}

export default function Page(){
  let [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {project} = useProject();
  const projectId = project._id

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
    return features.filter(f => !f.parent);
  };

  const renderFeatureEditor = (feature: Feature, level = 0) => {
    const children = features.filter(f => f.parent === feature._id);

    if (children) {
      return (
          <div key={feature._id} style={{marginLeft: `${level * 20}px`}}>
            <FeatureEditor projectId={projectId} featureId={feature._id}/>
            <HeadedAccordion>
              {children.map(child =>
                  <AccordionItem title={child.title} variant={VariantEnum.Outline} key={child._id}>
                    {renderFeatureEditor(child, level + 1)}
                  </AccordionItem>
                    )}
          </HeadedAccordion>
          </div>
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const rootFeatures = buildHierarchy(features);

  return (
    <div>
      <FeatureCreate projectId={projectId}/>
      <HeadedTabs tabs={rootFeatures.map(value => value.title)} >

      {rootFeatures.map(feature => renderFeatureEditor(feature))}
      </HeadedTabs>
    </div>
  )
}