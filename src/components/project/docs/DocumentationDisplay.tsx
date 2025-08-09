'use client';

import { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import DocumentationSectionDisplay from "@/components/project/documentation/section/DocumentationSectionDisplay";

interface DocumentationData {
  _id?: string;
  content: string;
  documentationSection: string[];
}

export default function DocumentationDisplay() {
  const { project } = useProject();
  const projectId = project._id;
  const [documentation, setDocumentation] = useState<DocumentationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/documentation`);
        if (response.ok) {
          const data = await response.json();
          setDocumentation(data);
        }
      } catch (error) {
        console.error('Error fetching documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchDocumentation();
    }
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (!documentation) return <div>No documentation found</div>;

  return (
    <div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{documentation.content}</div>

      {documentation.documentationSection.length > 0 && (
        <div>
          <h2>Sections:</h2>
          {documentation.documentationSection.map((sectionId) => (
            <DocumentationSectionDisplay
              key={sectionId}
              sectionId={sectionId}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}