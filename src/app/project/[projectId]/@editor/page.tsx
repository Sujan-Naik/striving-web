'use client'
import {ProjectMenu} from '@/components/project/ProjectMenu';
import { MemberManager } from '@/components/project/members/MemberManager';
import {useParams} from "next/navigation";


export default function ProjectPage() {
      return (
    <div className="container mx-auto p-4">
      Editor
      {/*<MemberManager projectId={projectId} />*/}
    </div>
  );
}