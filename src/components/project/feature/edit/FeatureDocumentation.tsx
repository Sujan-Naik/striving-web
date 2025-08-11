// components/FeatureDocs.tsx
import React from 'react';

interface FeatureDocsProps {
  projectId: string;
  docsSection?: string;
  manualSection?: string;
}

export default function FeatureDocs({
  projectId,
  docsSection,
  manualSection
}: FeatureDocsProps) {
  return (
    <div>
      <h3>Docs</h3>

      <div>
        <h4>Docs Section</h4>
        {docsSection ? (
          <div>Section ID: {docsSection}</div>
        ) : (
          <button>Create Docs Section</button>
        )}
      </div>

      <div>
        <h4>Manual Section</h4>
        {manualSection ? (
          <div>Section ID: {manualSection}</div>
        ) : (
          <button>Create Manual Section</button>
        )}
      </div>
    </div>
  );
}