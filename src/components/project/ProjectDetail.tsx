'use client';
import { useState, useEffect } from 'react';


interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { name: string; email: string };
  contributors: { name: string; email: string }[];
  githubRepo: string;
  createdAt: string;
}


interface User {
  username: string;
  email: string;
}

interface Props {
  projectId: string;
}

export function ProjectDetail({ projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/project/${projectId}`)
      .then(res => res.json())
      .then(setProject);
  }, [projectId]);

  useEffect(() => {
    if (project?.owner) {
      fetch(`/api/project/user/${project.owner}`)
        .then(res => res.json())
        .then(setOwner);
    }
  }, [project?.owner]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4">{project.description}</p>
      <p className="text-sm text-gray-600">
        Owner: {owner?.username || 'Loading...'}
      </p>
      <p>Github: {project.githubRepo}</p>
    </div>
  );
}