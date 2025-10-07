// components/GenericDisplay.tsx
import {ReactNode} from 'react';

interface GenericDisplayProps<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    renderContent: (data: T) => ReactNode;
    loadingText?: string;
    noDataText?: string;
}

export default function GenericDisplay<T>({
                                              data,
                                              loading,
                                              error,
                                              renderContent,
                                              loadingText = "Loading...",
                                              noDataText = "No data found"
                                          }: GenericDisplayProps<T>) {
    if (loading) return <div>{loadingText}</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>{noDataText}</div>;

    return <>{renderContent(data)}</>;
}