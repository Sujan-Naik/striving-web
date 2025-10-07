import {DocsProvider} from "@/context/DocsContext";
import React from "react";

export default function Layout({
                                   children,
                                   params
                               }: {
    children: React.ReactNode;
    params: Promise<{ projectId: string, docsId: string }>;

}) {

    const {projectId, docsId} = React.use(params);
    return (
        <DocsProvider docsId={docsId} projectId={projectId}>
            {children}
        </DocsProvider>
    );

    return (<div></div>)
}