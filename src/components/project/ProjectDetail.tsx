'use client';
import { useState, useEffect } from 'react';

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { username: string; email: string };
  contributors: { _id: string; username: string; email: string }[];
}

interface Props {
  projectId: string;
}

export function ProjectDetail({ projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch(`/api/project/${projectId}`)
      .then(res => res.json())
      .then(setProject);
  }, [projectId]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4">{project.description}</p>
      <p className="text-sm text-gray-600">
        Owner: {project.owner.username}
      </p>
    </div>
  );
}