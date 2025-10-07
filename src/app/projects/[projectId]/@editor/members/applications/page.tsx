'use client'
import ProjectApplications from "@/components/project/applications/ProjectApplications";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
      const { project, refreshProject } = useProject()!

    return <div>
        <p>Review Project Applications here</p>
        <ProjectApplications projectId={project._id}/>
    </div>
}