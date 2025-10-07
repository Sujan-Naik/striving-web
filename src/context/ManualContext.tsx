"use client";
import {createContext, useContext, useEffect, useState} from 'react';
import {IManual} from "@/types/project/Manual";

const ManualContext = createContext<{
    manual: IManual;
    setManual: (manual: IManual) => void;
} | null>(null);

export const ManualProvider = ({
                                   children,
                                   manualId,
                                   projectId
                               }: {
    children: React.ReactNode;
    manualId: string;
    projectId: string;
}) => {
    const [manual, setManual] = useState<IManual | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchManual = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/project/${projectId}/manual/${manualId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch manual');

                }
                const manualData = await response.json();
                setManual(manualData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchManual();
    }, [projectId]);

    if (loading) return <div>Loading...</div>;

    if (error) return <div>Error: {error}</div>;
    if (!manual) return <div>No manual found</div>;
    return (
        <ManualContext.Provider value={{manual, setManual}}>
            {children}
        </ManualContext.Provider>
    );
};

export const useManual = () => {
    const context = useContext(ManualContext);
    if (!context) {
        throw new Error('useManual must be used within a ManualProvider');
    }
    return context;
};