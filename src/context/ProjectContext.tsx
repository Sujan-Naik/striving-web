"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import {PipelineStage} from "mongoose";
import {Project} from "@/types/project/Project";


const ProjectContext = createContext<Project | null>(null);

export const ProjectProvider = ({
  children,
  projectId
}: {
  children: React.ReactNode;
  projectId: string;
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const projectData = await response.json();
        setProject(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // useEffect(() => {
  //   if (project?.owner) {
  //     const fetchOwner = async () => {
  //       try {
  //         const response = await fetch(`/api/project/user/${project.owner}`);
  //         if (!response.ok) {
  //           throw new Error('Failed to fetch owner');
  //         }
  //         const ownerData = await response.json();
  //
  //         setOwner(ownerData);
  //       } catch (err) {
  //         setError(err instanceof Error ? err.message : 'Unknown error');
  //       }
  //     };
  //
  //     fetchOwner();
  //   }
  // }, [project?.owner]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return null;

  return (
    <ProjectContext.Provider value={ project }>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};