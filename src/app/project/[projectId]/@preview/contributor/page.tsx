'use client'
import {ContributorDisplay} from "@/components/project/contributors/ContributorDisplay";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
        const project = useProject()!;

    return (<div>
        <ContributorDisplay projectId={project._id} />
    </div>)
}