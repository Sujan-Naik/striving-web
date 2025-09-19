'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedLink, VariantEnum} from "headed-ui";

export default function ManualList(){

    const project = useProject();
    return <div>
        {project.manual.map( (value, index) => {
           return  <HeadedLink variant={VariantEnum.Secondary} key={index} href={`manual/${value._id}`}>
           {value.content}
           </HeadedLink>
        })}
    </div>
}