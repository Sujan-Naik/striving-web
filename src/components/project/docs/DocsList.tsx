'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedLink, VariantEnum} from "headed-ui";

export default function DocsList(){

    const project = useProject();
    console.log(project)
    return <div>
        {project.docs.map( (value, index) => {
           return  <HeadedLink variant={VariantEnum.Secondary} key={index} href={`docs/${value._id}`}>
           {value.content}
           </HeadedLink>
        })}
    </div>
}