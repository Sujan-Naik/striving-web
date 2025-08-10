'use client'
import {ContributorManager} from "@/components/project/contributors/ContributorManager";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
    const project = useProject()!;
    return (<ContributorManager projectId={project._id}/>)
}