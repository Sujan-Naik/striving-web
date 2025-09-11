'use client'
import { ProjectList } from '@/components/project/ProjectList';
import CreateProject from "@/components/project/CreateProject";
import {useUser} from "@/context/UserContext";

export default function ProjectsPage() {
      const {user} = useUser();
      if (!user){
    return (
    <div className="container mx-auto p-4 center-column">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ProjectList />
    </div>
  );
  }

  return (
    <div className="container mx-auto p-4 center-column">
        <CreateProject />
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ProjectList />
    </div>
  );
}