'use client'
import FeatureDisplay from "@/components/project/feature/FeatureDisplay";
import {useProject} from "@/context/ProjectContext";

export default function Page(){
    const project = useProject()!;

  const projectId = project._id
    return (<div>
        <FeatureDisplay projectId={projectId}/>
    </div>)
}