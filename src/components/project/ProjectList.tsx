'use client';
import {useEffect, useState} from 'react';
import {HeadedGrid, VariantEnum} from "headed-ui";
import ProjectBadge from "@/components/project/ProjectBadge";
import {Project} from "@/types/project/Project";

export function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        fetch(`/api/project`)
            .then(res => {
                console.log(res)
                res.json().then(setProjects);
            })

    }, []);

    return (
        <div>
            <HeadedGrid variant={VariantEnum.Outline} height={'100%'} width={'auto'}>
                {projects.map(value => <ProjectBadge project={value} key={value._id}/>)}
            </HeadedGrid>
        </div>
    )
}