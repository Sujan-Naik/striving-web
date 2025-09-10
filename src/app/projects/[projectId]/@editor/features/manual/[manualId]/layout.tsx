import {useProject} from "@/context/ProjectContext";
import {ManualProvider} from "@/context/ManualContext";
import React from "react";
import ManualCreate from "@/components/project/manual/ManualCreate";
import ManualList from "@/components/project/manual/ManualList";

export default function Layout({
                                       children,
                                       params
                                     }: {
  children: React.ReactNode;
  params: Promise<{ projectId: string, manualId: string }>;

}) {

  const {projectId, manualId} = React.use(params);
  return (
      <div>

                  <ManualList/>
<ManualProvider manualId={manualId} projectId={projectId}>
        {children}
      </ManualProvider>
      </div>

  );

}