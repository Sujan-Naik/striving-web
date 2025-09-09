import { ProjectList } from '@/components/project/ProjectList';
import CreateProject from "@/components/project/CreateProject";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto p-4 center-column">
        {/*<h1>*/}
        {/*    Create a new project*/}
        {/*</h1>*/}
        {/*<CreateProject />*/}
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ProjectList />
    </div>
  );
}