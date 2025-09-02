'use client'
import {ProjectMenu} from '@/components/project/ProjectMenu';
import { MemberManager } from '@/components/project/members/MemberManager';
import {useParams} from "next/navigation";
import {ProjectEdit} from "@/components/project/ProjectEdit";


export default function ProjectPage() {
      return (
    <div className="container mx-auto p-4">
      <p> This is an editor section for Project owners. </p>

        <p>  Navigate to other project pages to make modifications. </p>
        <ProjectEdit/>
      {/*<MemberManager projectId={projectId} />*/}
    </div>
  );
}