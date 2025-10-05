'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Repository } from '@/types/github';
import RepoDetails from '@/components/github/RepoDetails/RepoDetails';
import CodeEditor from '@/components/github/CodeEditor/CodeEditor';
import DocumentationGeneration from "@/components/github/DocumentationGeneration/DocumentationGeneration";


export default function RepoPage() {
  const params = useParams();
  const repoName = params.repoName as string;
  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepository();
  }, [repoName]);

  const loadRepository = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userResponse = await fetch('/api/github/user');
      if (!userResponse.ok) {
        throw new Error(`Failed to get user: ${userResponse.status}`);
      }
      const user = await userResponse.json();

      const reposResponse = await fetch(`/api/github/repos/${repoName}?owner=${user.login}`);
      if (!reposResponse.ok) {
        throw new Error(`Failed to fetch repos: ${reposResponse.status}`);
      }

      setRepository(await reposResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading repository...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <Link href="/github">← Back to repositories</Link>
      </div>
    );
  }

  if (!repository) {
    return (
      <div>
        <p>Repository not found</p>
        <Link href="/github">← Back to repositories</Link>
      </div>
    );
  }

  return (
  <div>
    <Link href="/github">← Back to repositories</Link>
    <RepoDetails repository={repository} />
    <CodeEditor
      owner={repository.owner.login}
      repo={repository.name}
    />

    <DocumentationGeneration
      owner={repository.owner.login}
      repo={repository.name}
      initialBranch="main"
    />
  </div>
);
}