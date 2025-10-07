'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedGrid, HeadedLink, VariantEnum} from "headed-ui";

export default function DocsList() {

    const {project, refreshProject} = useProject();
    console.log(project)
    return <HeadedGrid variant={VariantEnum.Outline} height={"100%"} width={"100%"}>
        {project.docs.map((value, index) => {
            return <HeadedLink variant={VariantEnum.Secondary} key={index} href={`docs/${value._id}`}>
                {value.content}
            </HeadedLink>
        }) || <></>}
    </HeadedGrid>
}