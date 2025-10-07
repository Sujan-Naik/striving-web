"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { IFeature } from "@/types/project/Feature";

const FeatureContext = createContext<IFeature[] | null>(null);

export const FeatureProvider = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) => {
  const [feature, setFeature] = useState<IFeature[] | null>(null);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        console.log(projectId)
        const response = await fetch(`/api/project/${projectId}/features`);
        if (!response.ok) {
          throw new Error('Failed to fetch feature');
        }
        const featureData = await response.json();
        setFeature(featureData);
      } catch (err) {
        console.error('Failed to fetch feature:', err);
      }
    };

    fetchFeature();
  }, [projectId]);

  if (!feature) return <div>Loading...</div>;

  return (
    <FeatureContext.Provider value={feature}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = (): IFeature[] => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};