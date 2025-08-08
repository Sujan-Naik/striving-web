'use client';
import {useProject} from "@/context/ProjectContext";
import {HeadedLink, VariantEnum} from "headed-ui";


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

export function ProjectDetail() {
  const {project, owner} = useProject()

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4">{project.description}</p>
      <p className="text-sm text-gray-600">
        Owner: {owner?.username || 'Loading...'}
      </p>
      <p>Github: {project.githubRepo}</p>
      <HeadedLink variant={VariantEnum.Outline} href={'contributor'}>Contributors</HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={'docs'}>Documentation</HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={'feature'}>Features</HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={'wiki'}>Wiki</HeadedLink>
    </div>
  );
}