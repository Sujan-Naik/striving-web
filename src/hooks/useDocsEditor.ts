// hooks/useDocs.ts
import { useState, useEffect } from 'react';
import { IDocs, IDocsSectionOrder } from '@/types/project/Docs';
import { IFeature } from '@/types/project/Feature';
import {useProject} from "@/context/ProjectContext";

export function useDocsEditor() {

        const projectId = useProject()!._id!;

  const [docs, setDocs] = useState<IDocs>({
    project: projectId,
    content: '',
    docsSections: []
  });
  const [features, setFeatures] = useState<IFeature[]>([]);
  const [selectedDocsSections, setSelectedDocsSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [docsExists, setDocsExists] = useState<boolean | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const isEditing = docsExists === true;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docsResponse, featuresResponse] = await Promise.all([
          fetch(`/api/project/${projectId}/docs`),
          fetch(`/api/project/${projectId}/features`)
        ]);

        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocs(docsData);
          setDocsExists(true);
          setSelectedDocsSections(
            docsData.docsSections.map((section: IDocsSectionOrder) => section.docsSection._id)
          );
        } else {
          setDocsExists(false);
        }

        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json();
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setDocsExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return {
    docs,
    setDocs,
    features,
    selectedDocsSections,
    setSelectedDocsSections,
    loading,
    setLoading,
    isEditing,
    docsExists,
    draggedItem,
    setDraggedItem
  };
}