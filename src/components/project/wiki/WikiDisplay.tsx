'use client';

import { useState, useEffect } from 'react';
import { useProject } from "@/context/ProjectContext";
import WikiSectionDisplay from "@/components/project/wiki/section/WikiSectionDisplay";

interface WikiData {
  _id?: string;
  content: string;
  wikiSection: string[];
}

export default function WikiDisplay() {
  const { project } = useProject();
  const projectId = project._id;
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/wiki`);
        if (response.ok) {
          const data = await response.json();
          setWiki(data);
        }
      } catch (error) {
        console.error('Error fetching wiki:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchWiki();
    }
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (!wiki) return <div>No wiki found</div>;

  return (
    <div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{wiki.content}</div>

      {wiki.wikiSection.length > 0 && (
        <div>
          <h2>Sections:</h2>
          {wiki.wikiSection.map((sectionId) => (
            <WikiSectionDisplay
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