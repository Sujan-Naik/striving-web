'use client'
import {useProject} from "@/context/ProjectContext";
import {DocsProvider} from "@/context/DocsContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

      const projectId = useProject()._id;
  return (
    <DocsProvider projectId={projectId}>
      {children}
    </DocsProvider>
  );
}