'use client'
import {FeatureProvider} from '@/context/FeatureContext';
import {useProject} from "@/context/ProjectContext";

export default function Layout({
                                   children,
                               }: {
    children: React.ReactNode;
}) {

    const {project} = useProject();

    return (
        <FeatureProvider projectId={project._id}>
            {children}
        </FeatureProvider>
    );
}