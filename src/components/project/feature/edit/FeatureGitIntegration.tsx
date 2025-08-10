// components/FeatureGitIntegration.tsx
import React from 'react';
import CommitsList from './git/CommitsList';
import PullRequestsList from './git/PullRequestsList';
import {useProject} from "@/context/ProjectContext";

interface FeatureGitIntegrationProps {
  projectId: string;
  featureId: string;
  commitShas: string[];
  pullRequestNumbers: number[];
  onUpdate: (endpoint: string, data: any) => void;
}

export default function FeatureGitIntegration({
  projectId,
  featureId,
  commitShas,
  pullRequestNumbers,
  onUpdate
}: FeatureGitIntegrationProps) {

    const project = useProject()!;
    const githubRepo = project.githubRepo!
  return (
    <div>
      <h3>Git Integration</h3>
      <CommitsList
          githubRepo={githubRepo}
        projectId={projectId}
        featureId={featureId}
        commitShas={commitShas}
        onUpdate={onUpdate}
      />
      <PullRequestsList
          githubRepo={githubRepo}
        projectId={projectId}
        featureId={featureId}
        pullRequestNumbers={pullRequestNumbers}
        onUpdate={onUpdate}
      />
    </div>
  );
}