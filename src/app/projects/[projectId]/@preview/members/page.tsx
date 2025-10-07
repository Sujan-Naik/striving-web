'use client'
import {MemberDisplay} from "@/components/project/members/MemberDisplay";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
          const { project, refreshProject } = useProject()!;

    return (
        <MemberDisplay/>)
}