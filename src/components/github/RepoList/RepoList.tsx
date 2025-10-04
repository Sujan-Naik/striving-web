import React, { useState } from 'react';
import { Repository } from '@/types/github';
import { HeadedGrid, HeadedLink, VariantEnum } from "headed-ui";
import { useUser } from "@/context/UserContext";

interface RepoListProps {
  repositories: Repository[];
}

export default function RepoList({ repositories }: RepoListProps) {
  const user = useUser();
  const [filterText, setFilterText] = useState('');
  const [sortOption, setSortOption] = useState('name');

  if (!user || repositories.length === 0) {
    return <p>No repositories found.</p>;
  }

  console.log(repositories)

  const userRepos = repositories
    .filter(repo => repo.owner.login === user.user?.githubId)
    .filter(repo => repo.name.includes(filterText))
    .sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      } else if (sortOption === 'forks') {
        return b.forks_count - a.forks_count;
      }
      return 0;
    });

  return (
    <div className={'center-column p-6'}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Filter by name"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="stars">Sort by Stars</option>
          <option value="forks">Sort by Forks</option>
        </select>
      </div>

      <HeadedGrid variant={VariantEnum.Outline} height={"100%"} width={"100%"}>
  {userRepos.map((repo) => (
    <div
      key={repo.id}
      style={{
        border: '1px solid var(--border-color)',
        padding: '1rem',
        borderRadius: 'var(--border-radius)',
        boxSizing: 'border-box',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'var(--foreground-primary)',
      }}
    >
      <div>
          <HeadedLink variant={VariantEnum.Primary} href={`github/${repo.name}`}>
            {repo.name}
          </HeadedLink>
        {repo.description && (
          <p style={{
            margin: '0 0 0.5rem 0',
            maxHeight: '3em', // Adjust the height as needed
            overflowY: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2, // Number of lines before clipping
            WebkitBoxOrient: 'vertical',
            color: 'var(--foreground-secondary)',
          }}>
            {repo.description}
          </p>
        )}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--foreground-tertiary)',
      }}>
        <span>⭐ {repo.stargazers_count}</span>
        <span>🍴 {repo.forks_count}</span>
        {repo.language && <span>📝 {repo.language}</span>}
      </div>
    </div>
  ))}
</HeadedGrid>
    </div>
  );
}