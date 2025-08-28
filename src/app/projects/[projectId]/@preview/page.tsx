'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedCarousel, HeadedLink, HeadedTextAnim, TextAnimationType, VariantEnum, HeadedInput} from "headed-ui";
import {FaGithub} from "react-icons/fa";
import UserProfile from "@/components/project/user/UserProfile";

export default function ProjectPage() {
    const project = useProject()!;
    console.log(project.owner)
      return (
    <div className="container mx-auto p-4">
      <HeadedTextAnim animation={TextAnimationType.SLIDE_UP} delay={500}>{project.name}</HeadedTextAnim>
        <HeadedLink variant={VariantEnum.Outline} href={`https://github.com/${project.githubRepo}`}><FaGithub/></HeadedLink>
          Made by {project.owner.username}
        <HeadedCarousel variant={VariantEnum.Secondary} >
            <UserProfile user={project.owner}/>
            {project.members.map(value => {
                return <UserProfile user={value}/>
            })}
        </HeadedCarousel>
    </div>
  );
}