// components/FeatureDocumentation.tsx
import React from 'react';

interface FeatureDocumentationProps {
  projectId: string;
  documentationSection?: string;
  wikiSection?: string;
}

export default function FeatureDocumentation({
  projectId,
  documentationSection,
  wikiSection
}: FeatureDocumentationProps) {
  return (
    <div>
      <h3>Documentation</h3>

      <div>
        <h4>Documentation Section</h4>
        {documentationSection ? (
          <div>Section ID: {documentationSection}</div>
        ) : (
          <button>Create Documentation Section</button>
        )}
      </div>

      <div>
        <h4>Wiki Section</h4>
        {wikiSection ? (
          <div>Section ID: {wikiSection}</div>
        ) : (
          <button>Create Wiki Section</button>
        )}
      </div>
    </div>
  );
}