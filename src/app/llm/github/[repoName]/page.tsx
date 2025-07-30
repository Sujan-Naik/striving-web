'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Repository } from '@/types/github';
import RepoDetails from '@/components/github/RepoDetails/RepoDetails';
import {githubApi} from "@/lib/provider-api-client";

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
      const response = await githubApi.getRepos();
      if (!response.success) {
        throw new Error('Getting Repos Failed')
      }

      const repos = response.data || [];
      const repo = repos.find((r: Repository) => r.name === repoName);

      if (repo) {
        setRepository(repo);
      } else {
        setError('Repository not found');
      }
    } catch (error) {
      setError('Failed to load repository');
      console.error('Failed to load repository:', error);
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
        <Link href="/llm/github">← Back to repositories</Link>
      </div>
    );
  }

  if (!repository) {
    return (
      <div>
        <p>Repository not found</p>
        <Link href="/llm/github">← Back to repositories</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/llm/github">← Back to repositories</Link>
      <RepoDetails repository={repository} />
    </div>
  );
}