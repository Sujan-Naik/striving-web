'use client';
import {useProject} from "@/context/ProjectContext";
import {HeadedLink, VariantEnum} from "headed-ui";
import {Project} from "@/types/project/Project";

export function ProjectMenu() {
  const project: Project = useProject()
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4">{project.description}</p>
      <p className="text-sm text-gray-600">
        Owner: {project.owner.username || 'Loading...'}
      </p>
      <p>Github: {project.githubRepo}</p>
      <HeadedLink variant={VariantEnum.Outline} href={`/project/${project.name}/contributor`}>Contributors</HeadedLink>
      <HeadedLink variant={VariantEnum.Outline} href={`/project/${project.name}/application`}>Application</HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={`/project/${project.name}/docs`}>Documentation</HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={`/project/${project.name}/feature`}>Features</HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={`/project/${project.name}/wiki`}>Wiki</HeadedLink>
    </div>
  );
}