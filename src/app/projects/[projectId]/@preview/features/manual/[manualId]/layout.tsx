import {useProject} from "@/context/ProjectContext";
import {ManualProvider} from "@/context/ManualContext";
import React from "react";

export default function Layout({
                                       children,
                                       params
                                     }: {
  children: React.ReactNode;
  params: Promise<{ projectId: string, manualId: string }>;

}) {

  const {projectId, manualId} = React.use(params);
  return (
      <ManualProvider manualId={manualId} projectId={projectId}>
        {children}
      </ManualProvider>
  );

  return (<div></div>)
}