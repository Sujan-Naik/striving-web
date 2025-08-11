'use client';


import {IDocsSection} from "@/types/project/DocsSection";

interface Props {
  section: IDocsSection;
}

export default function DocsSectionDisplay({ section }: Props) {
  return (
    <div>
      <h1>{section.title}</h1>
      <div>{section.content}</div>
    </div>
  );
}