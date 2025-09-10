'use client';
import { useState, useEffect } from 'react';
import UserProfile from "@/components/project/user/UserProfile";
import {useProject} from "@/context/ProjectContext";



interface Props {
  projectId: string;
}

export function MemberDisplay() {
  const project = useProject()!


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Members</h2>

      <div className="space-y-2">
        {project.members.map(member => (
          <UserProfile key={member._id} user={member}/>
        ))}
      </div>
    </div>
  );
}