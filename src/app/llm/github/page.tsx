'use client';

import { useState, useEffect } from 'react';
import { githubApi } from '@/lib/provider-api-client';
import { Repository, CreateRepoData } from '@/types/github';
import RepoForm from '@/components/github/RepoForm/RepoForm';
import RepoList from '@/components/github/RepoList/RepoList';

export default function GitHubPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setIsLoading(true);
    try {
      const response = await githubApi.getRepos({ per_page: 50 });
      if (!response.success) {
        throw new Error('Getting Repos Failed')
      }

      setRepositories(response.data || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepo = async (data: CreateRepoData) => {
    setIsCreating(true);
    try {
      await githubApi.createRepo(data);
      await loadRepositories(); // Refresh the list
    } catch (error) {
      console.error('Failed to create repository:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <h1>GitHub Repository Manager</h1>

      <section>
        <h2>Create New Repository</h2>
        <RepoForm onSubmit={handleCreateRepo} isLoading={isCreating} />
      </section>

      <section>
        <h2>Your Repositories</h2>
        {isLoading ? (
          <p>Loading repositories...</p>
        ) : (
          <RepoList repositories={repositories} />
        )}
      </section>
    </div>
  );
}