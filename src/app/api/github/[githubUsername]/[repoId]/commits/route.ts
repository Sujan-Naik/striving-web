import {NextRequest, NextResponse} from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params:  Promise<{ githubUsername: string; repoId: string }> }
) {

  const { githubUsername, repoId } = await params;

  const mockCommits = Array.from({ length: 5 }, (_, i) => {
    const sha = Math.random().toString(36).substring(2, 42);
    return {
      sha,
      commit: {
        message: `Fix bug in user authentication module`,
        author: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          date: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        },
        committer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          date: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        }
      },
      author: {
        login: githubUsername,
        id: 12345,
        avatar_url: `https://avatars.githubusercontent.com/u/12345?v=4`,
        html_url: `https://github.com/${githubUsername}`
      },
      html_url: `https://github.com/${githubUsername}/${repoId}/commit/${sha}`,
      stats: {
        additions: Math.floor(Math.random() * 100),
        deletions: Math.floor(Math.random() * 50),
        total: Math.floor(Math.random() * 150)
      }
    };
  });

  return NextResponse.json(mockCommits);
}