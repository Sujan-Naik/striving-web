'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedCarousel, HeadedLink, HeadedTextAnim, TextAnimationType, VariantEnum, HeadedInput} from "headed-ui";
import {FaGithub} from "react-icons/fa";
import UserProfile from "@/components/project/user/UserProfile";

export default function ProjectPage() {
    const project = useProject()!;
      return (
    <div className="container mx-auto p-4">
      <HeadedTextAnim animation={TextAnimationType.SLIDE_UP} delay={500}>{project.name}</HeadedTextAnim>
        <HeadedTextAnim animation={TextAnimationType.SLIDE_UP} delay={1000} >{project.description}</HeadedTextAnim>
        <HeadedLink variant={VariantEnum.Outline} href={`https://github.com/${project.githubRepo}`}><FaGithub/></HeadedLink>
          Made by {project.owner.username}
            <UserProfile user={project.owner}/>
        {project.members.length > 1 &&
                <HeadedCarousel variant={VariantEnum.Secondary} >
            {project.members.filter(value => value==project.owner).map(value => {
                return <UserProfile user={value}/>
            })}
            </HeadedCarousel>
        }
    </div>
  );
}