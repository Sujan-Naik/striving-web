'use client'
import {ProjectList} from '@/components/project/ProjectList';
import CreateProject from "@/components/project/CreateProject";
import {useUser} from "@/context/UserContext";
import {HeadedButton, HeadedModal, VariantEnum} from "headed-ui";
import {useState} from "react";

export default function ProjectsPage() {
    const [openCreateProjectModal, setProjectModal] = useState<boolean>(false)

    try {
        const {user} = useUser();
        return (
            <div className="container mx-auto p-4 center-column">
                <HeadedModal isOpen={openCreateProjectModal} onClose={() => setProjectModal(false)}
                             title={'Create Project'} variant={VariantEnum.Primary}>
                    <CreateProject/>
                </HeadedModal>
                <HeadedButton variant={VariantEnum.Outline} onClick={() => setProjectModal(true)}>
                    Create Project
                </HeadedButton>
                <h1 className="text-2xl font-bold mb-4">Projects</h1>
                <ProjectList/>
            </div>
        );
    } catch {
        return (
            <div className="container mx-auto p-4 center-column">
                <h1 className="text-2xl font-bold mb-4">Projects</h1>
                <ProjectList/>
            </div>
        );
    }

}