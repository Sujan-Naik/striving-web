import { Repository } from '@/types/github';

interface RepoDetailsProps {
  repository: Repository;
}

export default function RepoDetails({ repository }: RepoDetailsProps) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ margin: 0 }}>{repository.name}</h1>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0070f3',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            border: '1px solid #0070f3',
            borderRadius: '4px',
          }}
        >
          View on GitHub
        </a>
      </header>

      {repository.description && (
        <p
          style={{
            fontSize: '1.125rem',
            color: '#666',
            marginBottom: '2rem',
          }}
        >
          {repository.description}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '1rem',
            border: '1px solid #eee',
            borderRadius: '4px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#666',
              marginBottom: '0.25rem',
            }}
          >
            Stars
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {repository.stargazers_count}
          </span>
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '1rem',
            border: '1px solid #eee',
            borderRadius: '4px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#666',
              marginBottom: '0.25rem',
            }}
          >
            Forks
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {repository.forks_count}
          </span>
        </div>

        {repository.language && (
          <div
            style={{
              textAlign: 'center',
              padding: '1rem',
              border: '1px solid #eee',
              borderRadius: '4px',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#666',
                marginBottom: '0.25rem',
              }}
            >
              Language
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {repository.language}
            </span>
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            padding: '1rem',
            border: '1px solid #eee',
            borderRadius: '4px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#666',
              marginBottom: '0.25rem',
            }}
          >
            Private
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {repository.private ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p style={{ margin: '0.25rem 0', color: '#666' }}>
          Created: {new Date(repository.created_at).toLocaleDateString()}
        </p>
        <p style={{ margin: '0.25rem 0', color: '#666' }}>
          Updated: {new Date(repository.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
