'use client';

import { documentationSection } from '../DocsDisplay';

interface Props {
  section: documentationSection;
}

export default function DocumentationSectionDisplay({ section }: Props) {
  return (
    <div>
      <h1>{section.title}</h1>
      <div>{section.content}</div>
    </div>
  );
}