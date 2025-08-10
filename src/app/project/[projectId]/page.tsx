'use client'
import {ProjectMenu} from '@/components/project/ProjectMenu';
import {HeadedLink, VariantEnum} from "headed-ui";


export default function ProjectPage() {
      return (
    <div className="container mx-auto p-4">
      <ProjectMenu />
      {/*<ContributorManager projectId={projectId} />*/}

    </div>
  );
}