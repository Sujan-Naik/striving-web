'use client'
import {ProjectDetail} from '@/components/project/ProjectDetail';
import { ContributorManager } from '@/components/project/ContributorManager';
import {useParams} from "next/navigation";


export default function ProjectPage() {
    const params = useParams();
      const projectId = params.projectId as string;
      return (
    <div className="container mx-auto p-4">
      <ProjectDetail projectId={projectId} />
      {/*<ContributorManager projectId={projectId} />*/}
    </div>
  );
}