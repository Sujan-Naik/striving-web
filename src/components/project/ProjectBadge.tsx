import {Project} from "@/types/project/Project";
import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui";

export default function ProjectBadge({ project }: { project: Project }) {
  return (
      <HeadedLink variant={VariantEnum.Outline} href={`/project/${project.name}`}>
        <HeadedCard variant={VariantEnum.Primary}>
          <p>{project.name}</p>
          <p>Owned by: {project.owner.username}</p>
          <p>{project.description}</p>
          {project.contributors.map((contributor, index) => (
            <p key={index}>{contributor.username}</p>
          ))}
          <p>Github: {project.githubRepo}</p>
          {project.createdAt && <p>Created at: {String(project.createdAt)}</p>}
          {project.updatedAt && <p>Updated at: {String(project.updatedAt)}</p>}
        </HeadedCard>
      </HeadedLink>
  );
}