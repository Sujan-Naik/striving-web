'use client'
import {MemberManager} from "@/components/project/members/MemberManager";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
    const project = useProject()!;
    return (<MemberManager projectId={project._id}/>)
}