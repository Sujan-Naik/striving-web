import {useProject} from "@/context/ProjectContext";
import {DocsProvider} from "@/context/DocsContext";
import React from "react";
import DocsCreate from "@/components/project/docs/DocsCreate";
import DocsList from "@/components/project/docs/DocsList";

export default function Layout({
                                       children,
                                       params
                                     }: {
  children: React.ReactNode;
  params: Promise<{ projectId: string, docsId: string }>;

}) {

  const {projectId, docsId} = React.use(params);
  return (
      <div>

                  <DocsList/>
<DocsProvider docsId={docsId} projectId={projectId}>
        {children}
      </DocsProvider>
      </div>

  );

}