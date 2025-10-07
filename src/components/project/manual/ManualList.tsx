'use client'
import {useProject} from "@/context/ProjectContext";
import {HeadedGrid, HeadedLink, VariantEnum} from "headed-ui";

export default function ManualList() {

    const {project, refreshProject} = useProject();
    console.log(project)
    return <HeadedGrid variant={VariantEnum.Outline} height={"100%"} width={"100%"}>
        {project.manual.map((value, index) => {
            return <HeadedLink variant={VariantEnum.Secondary} key={index} href={`manual/${value._id}`}>
                {value.content}
            </HeadedLink>
        }) || <></>}
    </HeadedGrid>
}