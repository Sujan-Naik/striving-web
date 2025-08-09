'use client'
import {useEffect, useState} from "react";
import {useProject} from "@/context/ProjectContext";
import FeatureEditor from "@/components/project/feature/FeatureEditor";
import FeatureCreate from "@/components/project/feature/FeatureCreate";


interface Feature {
  _id: string;
  title: string;
  description: string;
  state: string;
  assignedUsers: string[];
  commitShas: string[];
  pullRequestNumbers: number[];
  documentationSection?: string;
  wikiSection?: string;
}

interface FeatureEditorProps {
  projectId: string;
  featureId: string;
}


export default function Page(){

    const [features, setFeatures] = useState<Feature[]>([]);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

    return (<div>
                <FeatureCreate projectId={projectId}/>

        {features.map(value => {return <FeatureEditor key={value._id} projectId={projectId} featureId={value._id}/>})}
    </div>)
}