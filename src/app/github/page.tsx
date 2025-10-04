'use client';

import { useState, useEffect } from 'react';
import { CreateRepoData } from '@/types/github';
import RepoForm from '@/components/github/RepoForm/RepoForm';
import RepoList from '@/components/github/RepoList/RepoList';
import {useGithubRepository} from "@/hooks/useGithubRepository";
import {HeadedLink, VariantEnum} from "headed-ui";
import {useUser} from "@/context/UserContext";
import {useSession} from "next-auth/react";

export default function GitHubPage() {

  const [isCreating, setIsCreating] = useState(false);

    const { repos, loading, error, refetch } = useGithubRepository()

  const session = useSession();
  if (!session.data?.user){
    return (<div className={'center-column'}>
      This Page is only available for logged in users!
    </div>)
  }

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

  return (
    <div className={'center-column'}>
      <h1>GitHub Repository Manager</h1>
      {/*<HeadedLink variant={VariantEnum.Primary} href={'/github/projects'}>Projects</HeadedLink>*/}
      <section className={'center-column'}>
        <h2>Create New Repository</h2>
        <RepoForm onSubmit={handleCreateRepo} isLoading={isCreating} />
      </section>

      <section className={'center-column'}>
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