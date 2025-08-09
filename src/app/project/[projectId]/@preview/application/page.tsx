'use client'
import { useEffect, useState } from "react";
import ApplyToProject from "@/components/project/application/ApplyToProject";
import { useProject } from "@/context/ProjectContext";
import { useUser } from "@/context/UserContext";

export default function Page() {
  const { project } = useProject();
  const { user } = useUser();
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  if (project.owner === user!._id){
    return <div>
      You can't apply as you own this project
    </div>
  }
  useEffect(() => {
    if (!project?._id || !user?._id) return;

    const checkApplication = async () => {
      try {
        const response = await fetch(`/api/project/${project._id}/applications`);
        const applications = await response.json();

        const userApplied = applications.some((app: { userId: unknown; }) => app.userId === user._id);
        setHasApplied(userApplied);
      } catch (error) {
        console.error('Failed to check applications:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [project?._id, user?._id]);

  const handleApplicationSubmit = () => {
    setHasApplied(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <ApplyToProject
        projectId={project._id}
        hasApplied={hasApplied}
        onApplicationSubmit={handleApplicationSubmit}
      />
    </div>
  );
}