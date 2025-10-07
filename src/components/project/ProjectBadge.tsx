import {Project} from "@/types/project/Project";
import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function ProjectBadge({project}: { project: Project }) {
    return (
        <HeadedLink variant={VariantEnum.Outline} href={`/projects/${project.name}`}>
            <HeadedCard variant={VariantEnum.Primary}>
                <p>{project.name}</p>
                <p>Owned by: {project.owner.username}</p>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                {project.members.map((member, index) => (
                    <p key={index}>{member.username}</p>
                ))}
                <p>Github: {project.githubRepo}</p>
                {project.createdAt && <p>Created at: {String(project.createdAt)}</p>}
                {project.updatedAt && <p>Updated at: {String(project.updatedAt)}</p>}
            </HeadedCard>
        </HeadedLink>
    );
}