// hooks/useManual.ts
import { useState, useEffect } from 'react';
import { IManual, IManualSectionOrder } from '@/types/project/Manual';
import { IFeature } from '@/types/project/Feature';
import {useProject} from "@/context/ProjectContext";

export function useManualEditor() {

        const projectId = useProject()!._id!;

  const [manual, setManual] = useState<IManual>({
    project: projectId,
    content: '',
    manualSections: []
  });
  const [features, setFeatures] = useState<IFeature[]>([]);
  const [selectedManualSections, setSelectedManualSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualExists, setManualExists] = useState<boolean | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const isEditing = manualExists === true;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [manualResponse, featuresResponse] = await Promise.all([
          fetch(`/api/project/${projectId}/manual`),
          fetch(`/api/project/${projectId}/features`)
        ]);

        if (manualResponse.ok) {
          const manualData = await manualResponse.json();
          setManual(manualData);
          setManualExists(true);
          setSelectedManualSections(
            manualData.manualSections.map((section: IManualSectionOrder) => section.manualSection._id)
          );
        } else {
          setManualExists(false);
        }

        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setManualExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return {
    manual,
    setManual,
    features,
    selectedManualSections,
    setSelectedManualSections,
    loading,
    setLoading,
    isEditing,
    manualExists,
    draggedItem,
    setDraggedItem
  };
}