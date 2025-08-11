'use client'
import { FeatureProvider } from '@/context/FeatureContext';
import {useProject} from "@/context/ProjectContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

      const projectId = useProject()._id;
  return (
    <FeatureProvider projectId={projectId}>
      {children}
    </FeatureProvider>
  );
}