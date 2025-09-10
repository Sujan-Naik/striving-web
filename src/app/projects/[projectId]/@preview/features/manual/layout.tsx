'use client'
import {useProject} from "@/context/ProjectContext";
import {ManualProvider} from "@/context/ManualContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

      const projectId = useProject()._id;
  return (
    <ManualProvider projectId={projectId}>
      {children}
    </ManualProvider>
  );
}