'use client'
import { useSession } from "next-auth/react";
import { UserProvider, useUser } from "@/context/UserContext";
import React from "react";
import {ProjectProvider, useProject} from "@/context/ProjectContext";

function LayoutContent({ children, editor, preview }: { children: React.ReactNode, editor: React.ReactNode, preview: React.ReactNode }) {
  const { project, owner } = useProject();
const {user} = useUser();

  if (!project) return <div>No project found</div>;

  if (owner.username === user?.username) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-shrink-0">
          {children}
        </div>
        <div className="w-1/2 border-r">
          {editor}
        </div>
          <div className="w-1/2">
            {preview}
          </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0">
        {children}
      </div>
      <div className="flex-1 flex">

        <div className="w-1/2">
          {preview}
        </div>
      </div>
    </div>
  );
}

export default function Layout({
  children,
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
      <LayoutContent children={children} editor={editor} preview={preview}/>
    </ProjectProvider>
  );
}