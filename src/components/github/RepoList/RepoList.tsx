import {Repository} from '@/types/github';
import {HeadedLink, VariantEnum} from "headed-ui";

interface RepoListProps {
  repositories: Repository[];
}

export default function RepoList({ repositories }: RepoListProps) {
  if (repositories.length === 0) {
    return <p>No repositories found.</p>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
      }}
    >
      {repositories.map((repo) => (
        <div
          key={repo.id}
          style={{
            border: '1px solid var(--border-color)',
            padding: '1rem',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>
            <HeadedLink
                variant={VariantEnum.Primary}
              href={`/llm/github/${repo.name}`}
            >
              {repo.name}
            </HeadedLink>
          </h3>
          {repo.description && (
            <p
              style={{
                margin: '0 0 0.5rem 0'
              }}
            >
              {repo.description}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <span>⭐ {repo.stargazers_count}</span>
            <span>🍴 {repo.forks_count}</span>
            {repo.language && <span>📝 {repo.language}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
