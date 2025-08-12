'use client'
import ProjectApplications from "@/components/project/applications/ProjectApplications";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
    const project = useProject()!

    return <div>
        <ProjectApplications projectId={project._id}/>
    </div>
}