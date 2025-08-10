'use client';

import { wikiSection } from '../WikiDisplay';

interface Props {
  section: wikiSection;
}

export default function WikiSectionDisplay({ section }: Props) {
  return (
    <div>
      <h1>{section.title}</h1>
      <div>{section.content}</div>
    </div>
  );
}