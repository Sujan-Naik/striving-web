'use client';
import {useEffect, useState} from 'react';
import {useUser} from "@/context/UserContext";
import {HeadedGrid, VariantEnum} from "headed-ui";
import ProjectBadge from "@/components/project/ProjectBadge";
import {Project} from "@/types/project/Project";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
const {user} = useUser();

  if (!user){
    return (<div>
      User not logged in
    </div>)
  }
  useEffect(() => {
    // fetch(`/api/project?ownerId=${user._id}`)
    fetch(`/api/project`)
      .then(res => {
        console.log(res)
        res.json().then(setProjects);
      })

  }, []);

  return (
      <div>
        <HeadedGrid variant={VariantEnum.Outline} height={'100%'} width={'auto'}>
          {projects.map(value => <ProjectBadge project={value} key={value._id}/>)}
      </HeadedGrid>
      </div>
  )
  // return (
  //   <div className="grid gap-4">
  //     {projects && projects.length > 0 && projects.map(project => (
  //       <div key={project._id} className="border p-4 rounded">
  //         <Link href={`/project/${project._id}`}>
  //           <h3 className="text-lg font-semibold">{project.name}</h3>
  //           <p>{project.description}</p>
  //           <span className="text-sm text-gray-600">
  //             {project.contributors.length} contributors
  //           </span>
  //         </Link>
  //       </div>
  //     ))}
  //   </div>
  // );
}