'use client';


import {IDocsSection} from "@/types/project/DocsSection";
import ReactMarkdown from "react-markdown";

interface Props {
  section: IDocsSection;
}

export default function DocsSectionDisplay({ section }: Props) {

  return (
    <div className={"center-column"}>
      <h1>{section.title}</h1>
      <div>
          <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
    </div>
  );
}