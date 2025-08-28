'use client';


import {IManualSection} from "@/types/project/ManualSection";

interface Props {
  section: IManualSection;
}

export default function ManualSectionDisplay({ section }: Props) {
  return (
    <div className={"center-column"}>
      <h1>{section.title}</h1>
      <div>{section.content}</div>
    </div>
  );
}