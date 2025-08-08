'use client'
import {ProjectDetail} from '@/components/project/ProjectDetail';
import {HeadedLink, VariantEnum} from "headed-ui";


export default function ProjectPage() {
      return (
    <div className="container mx-auto p-4">
      <ProjectDetail />
      {/*<ContributorManager projectId={projectId} />*/}

    </div>
  );
}