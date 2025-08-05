import Link from 'next/link';
import { Repository } from '@/types/github';
import styles from '@/styles/RepoList.module.css';

interface RepoListProps {
  repositories: Repository[];
}

export default function RepoList({ repositories }: RepoListProps) {
  if (repositories.length === 0) {
    return <p>No repositories found.</p>;
  }
  return (
    <div className={styles.list}>
      {repositories.map((repo, index) => (
        <div key={index} className={styles.item}>
          <h3>
            <Link href={`/github/${repo.name}`}>
              {repo.name}
            </Link>
          </h3>
          {repo.description && <p>{repo.description}</p>}
          <div className={styles.meta}>
            <span>⭐ {repo.stargazers_count}</span>
            <span>🍴 {repo.forks_count}</span>
            {repo.language && <span>📝 {repo.language}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}