'use client'
import { useSession } from "next-auth/react";
import { UserProvider, useUser } from "@/context/UserContext";
import React from "react";
import {ProjectProvider, useProject} from "@/context/ProjectContext";
import {ProjectMenu} from "@/components/project/ProjectMenu";

function LayoutContent({ editor, preview }: {editor: React.ReactNode, preview: React.ReactNode }) {
const { project, owner } = useProject();
const {user} = useUser();

if (!project) return <div>No project found</div>;

if (owner.username === user?.username) {
return (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <div style={{ flexShrink: 0 }}>
      <ProjectMenu></ProjectMenu>
    </div>
    <div style={{ display: 'flex', flex: 1 }}>
      <div style={{ width: '50%', borderRight: '1px solid #ccc', display: 'flex', justifyContent: 'center' }}>
        {editor}
      </div>
      <div style={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
        {preview}
      </div>
    </div>
  </div>
);
}

return (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <div style={{ flexShrink: 0 }}>
    </div>
    <div style={{ flex: 1, display: 'flex' }}>
        <ProjectMenu></ProjectMenu>
      <div style={{ width: '50%' }}>
        {preview}
      </div>
    </div>
  </div>
);
}

export default function Layout({
// children,
editor,
preview,
params
}: {
children: React.ReactNode;
editor: React.ReactNode;
preview: React.ReactNode;
params: Promise<{ projectId: string }>;
}) {
const { data: session, status } = useSession();
const { projectId } = React.use(params);

if (status === "loading") return <div>Loading...</div>;

return (
  <ProjectProvider projectId={projectId}>
    <LayoutContent  editor={editor} preview={preview}/>
  </ProjectProvider>
);
}