'use client';

import { useState, useEffect } from 'react';
import {useProject} from "@/context/ProjectContext";

interface Wiki {
  _id: string;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function WikiDisplay() {
  const { project } = useProject();
  const projectId = project._id
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const response = await fetch(`/api/project/wiki/project/${projectId}`);
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
      <h1>{wiki.title}</h1>
      <p>{wiki.description}</p>
      <div>
        <h3>Content:</h3>
        <div style={{ whiteSpace: 'pre-wrap' }}>{wiki.content}</div>
      </div>
      <small>
        Created: {new Date(wiki.createdAt).toLocaleDateString()} |
        Updated: {new Date(wiki.updatedAt).toLocaleDateString()}
      </small>
    </div>
  );
}