// app/github/page.tsx
import { GithubRepos } from "@/components/github/github-repos"
import {HeadedLink, VariantEnum} from "headed-ui";
import {GithubProjects} from "@/components/github/github-projects";

export default function GithubPage() {
  return (
    <div className="container mx-auto p-6">
      <GithubProjects />

    </div>
  )
}