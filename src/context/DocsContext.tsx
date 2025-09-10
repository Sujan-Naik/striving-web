"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { IDocs } from "@/types/project/Docs";

const DocsContext = createContext<{
  docs: IDocs;
  setDocs: (docs: IDocs) => void;
} | null>(null);

export const DocsProvider = ({
  children,
  docsId,
    projectId
}: {
  children: React.ReactNode;
  docsId: string;
  projectId: string;
}) => {
  const [docs, setDocs] = useState<IDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/project/${projectId}/docs/${docsId}`);
        if (!response.ok) {
                    throw new Error('Failed to fetch docs');

        }
        const docsData = await response.json();
        setDocs(docsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error: {error}</div>;
  if (!docs) return <div>No docs found</div>;
  return (
    <DocsContext.Provider value={{ docs, setDocs }}>
      {children}
    </DocsContext.Provider>
  );
};

export const useDocs = () => {
  const context = useContext(DocsContext);
  if (!context) {
    throw new Error('useDocs must be used within a DocsProvider');
  }
  return context;
};