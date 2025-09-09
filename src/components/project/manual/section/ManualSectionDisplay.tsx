'use client';


import {IManualSection} from "@/types/project/ManualSection";
import ReactMarkdown from "react-markdown";

interface Props {
  section: IManualSection;
}

export default function ManualSectionDisplay({ section }: Props) {
  return (
    <div className={"center-column"}>
      <h1>{section.title}</h1>
      <div>
          <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
    </div>
  );
}