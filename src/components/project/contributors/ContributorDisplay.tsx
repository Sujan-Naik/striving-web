'use client';
import { useState, useEffect } from 'react';
import UserProfile from "@/components/project/user/UserProfile";
import {useProject} from "@/context/ProjectContext";



interface Props {
  projectId: string;
}

export function ContributorDisplay() {
  const project = useProject()!


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contributors</h2>

      <div className="space-y-2">
        {project.contributors.map(contributor => (
          <UserProfile key={contributor._id} user={contributor}/>
        ))}
      </div>
    </div>
  );
}