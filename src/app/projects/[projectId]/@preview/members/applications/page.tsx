'use client'
import {useEffect, useState} from "react";
import ApplyToProject from "@/components/project/applications/ApplyToProject";
import {useProject} from "@/context/ProjectContext";
import {useUser} from "@/context/UserContext";

export default function Page() {
  const  {project} = useProject()!;
  const { user } = useUser();
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  if (project.owner._id == user?._id){
    console.log('test')
    return <div>
      You can't apply as you own this project
    </div>
  }
  useEffect(() => {
    if (!project?._id || !user) return;

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

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <ApplyToProject
                projectId={project._id!}
                hasApplied={hasApplied}
                onApplicationSubmit={handleApplicationSubmit}
            />
        </div>
    );
}