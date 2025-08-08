'use client'
import { useSession } from "next-auth/react";
import { UserProvider, useUser } from "@/context/UserContext";
import React from "react";
import {ProjectProvider, useProject} from "@/context/ProjectContext";

function LayoutContent({ children, editor, preview }: { children: React.ReactNode, editor: React.ReactNode, preview: React.ReactNode }) {
  const { project, owner } = useProject();

  if (!project) return <div>No project found</div>;

  return (
    <div>
      <header>{`Welcome to ${project.name} by ${owner.username}`}</header>
      {children}
        {editor}
        {preview}
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