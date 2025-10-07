'use client';

import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {Project} from "@/types/project/Project";

interface ProjectContextType {
    project: Project;
    loading: boolean;
    error: string | null;
    refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({
                                    children,
                                    projectId
                                }: {
    children: React.ReactNode;
    projectId: string;
}) => {
    const [project, setProject] = useState<Project>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProject = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/project/${projectId}`);
            if (!response.ok) {
                const json = await response.json();
                console.log(json.error);
                throw new Error(json.error || 'Failed to fetch project');
            }
            const projectData = await response.json();
            setProject(projectData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]); // Depend on fetchProject to handle projectId changes

    // Optional: Render loading/error states (uncomment if needed)
    // if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!project) return null;

    return (
        <ProjectContext.Provider value={{project, loading, error, refreshProject: fetchProject}}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};