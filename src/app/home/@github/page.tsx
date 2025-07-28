// app/github/page.tsx
import { GithubRepos } from "@/components/github/github-repos"

export default function GithubPage() {
  return (
    <div className="container mx-auto p-6">
      <GithubRepos />
    </div>
  )
}