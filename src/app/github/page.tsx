'use client';

import { useState, useEffect } from 'react';
import { CreateRepoData } from '@/types/github';
import RepoForm from '@/components/github/RepoForm/RepoForm';
import RepoList from '@/components/github/RepoList/RepoList';
import {useGithubRepository} from "@/hooks/useGithubRepository";
import {HeadedLink, VariantEnum} from "headed-ui";

export default function GitHubPage() {

  const [isCreating, setIsCreating] = useState(false);

    const { repos, loading, error, refetch } = useGithubRepository()


  const handleCreateRepo = async (data: CreateRepoData) => {
    setIsCreating(true);

    try {
       const userResponse = await fetch('/api/github/user');

      if (!userResponse.ok) {
        throw new Error(`Failed to get user: ${userResponse.status}`);
      }
      const user = await userResponse.json();

      await fetch(`/api/github/repos?owner=${user.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      await refetch();
    } catch (error) {
      console.error('Failed to create repository:', error);
    } finally {
      setIsCreating(false);
    }
  };

  console.log(repos)
  return (
    <div>
      <h1>GitHub Repository Manager</h1>
      <HeadedLink variant={VariantEnum.Primary} href={'/github/projects'}>Projects</HeadedLink>
      <section>
        <h2>Create New Repository</h2>
        <RepoForm onSubmit={handleCreateRepo} isLoading={isCreating} />
      </section>

      <section>
        <h2>Your Repositories</h2>
        {loading ? (
          <p>Loading repositories...</p>
        ) : (
          <RepoList repositories={repos} />
        )}
      </section>
    </div>
  );
}