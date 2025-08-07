import {ProjectDetail} from '@/components/project/ProjectDetail';
import { ContributorManager } from '@/components/project/ContributorManager';

interface Props {
  params: { id: string };
}

export default function ProjectPage({ params }: Props) {
  return (
    <div className="container mx-auto p-4">
      <ProjectDetail projectId={params.id} />
      <ContributorManager projectId={params.id} />
    </div>
  );
}