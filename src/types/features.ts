// types/feature.ts
export interface Feature {
  _id: string;
  title: string;
  description: string;
  state: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  commitShas: string[];
  pullRequestNumbers: number[];
  parent?: string;
  children: string[];
  documentationSection?: string;
  wikiSection?: string;
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface GitPullRequest {
  number: number;
  title: string;
  state: string;
  url: string;
}

export interface FeatureEditorProps {
  projectId: string;
  featureId: string;
}