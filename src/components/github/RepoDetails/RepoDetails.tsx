import { Repository } from '@/types/github';
import styles from '@/styles/RepoDetails.module.css';

interface RepoDetailsProps {
  repository: Repository;
}

export default function RepoDetails({ repository }: RepoDetailsProps) {
  return (
    <div className={styles.details}>
      <header className={styles.header}>
        <h1>{repository.name}</h1>
        <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </header>

      {repository.description && (
        <p className={styles.description}>{repository.description}</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Stars</span>
          <span className={styles.value}>{repository.stargazers_count}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Forks</span>
          <span className={styles.value}>{repository.forks_count}</span>
        </div>
        {repository.language && (
          <div className={styles.stat}>
            <span className={styles.label}>Language</span>
            <span className={styles.value}>{repository.language}</span>
          </div>
        )}
        <div className={styles.stat}>
          <span className={styles.label}>Private</span>
          <span className={styles.value}>{repository.private ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className={styles.dates}>
        <p>Created: {new Date(repository.created_at).toLocaleDateString()}</p>
        <p>Updated: {new Date(repository.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}