"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface Repo {
  name: string;
  description: string;
  html_url: string;
}

export default function Page() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicRepos = async () => {
      if (status !== "authenticated" || !session?.user?.githubAccessToken) {
        setLoading(false);
        return;
      }

      const token = session.user.githubAccessToken;

      try {
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json',
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Map the repositories to our Repo interface
        const reposData: Repo[] = data
          .filter((repo: any) => repo.private === false) // filter for public repos only
          .map((repo: any) => ({
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
          }));

        setRepos(reposData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicRepos();
  }, [session, status]);

  if (loading) {
    return <div>Loading repositories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!repos.length) {
    return <div>No public repositories found or not authenticated.</div>;
  }

  return (
    <div>
      <h1>Your Public Repositories</h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo.html_url}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              {repo.name}
            </a>
            <p>{repo.description}</p>

          </li>
        ))}
      </ul>
    </div>
  );
}