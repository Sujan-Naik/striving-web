'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedCard, HeadedCarousel, HeadedLink, HeadedTextAnim, TextAnimationType, VariantEnum} from "headed-ui";
import {FaGithub} from "react-icons/fa";
import UserProfile from "@/components/project/user/UserProfile";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function ProjectPage() {
    const project = useProject()!;
      return (
    <>
        <div className={'block w-full justify-center flex'}>

            <HeadedLink variant={VariantEnum.Outline}  href={`https://github.com/${project.githubRepo}`} className="font-semibold inline-flex items-center gap-2">
                    <FaGithub/> {project.name}
                </HeadedLink>

</div>

        {/*<HeadedTextAnim animation={TextAnimationType.SLIDE_UP} delay={1000}>*/}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
        {/*</HeadedTextAnim>*/}

        <HeadedCard width={'100%'}  variant={VariantEnum.Outline}>

          Made by {project.owner.username}             <UserProfile user={project.owner}/>

        {project.members.length > 1 &&
                <HeadedCarousel variant={VariantEnum.Secondary} >
            {project.members.filter(value => value==project.owner).map(value => {
                return <UserProfile user={value}/>
            })}
            </HeadedCarousel>
        }
                </HeadedCard>

    </>
  );
}