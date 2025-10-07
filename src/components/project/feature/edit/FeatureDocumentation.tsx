// components/FeatureDocs.tsx
import React from 'react';
import {HeadedButton, VariantEnum} from "headed-ui";

interface FeatureDocsProps {
    projectId: string;
    docsSection?: string;
    manualSection?: string;
}

export default function FeatureDocs({
                                        projectId,
                                        docsSection,
                                        manualSection
                                    }: FeatureDocsProps) {
    return (
        <div>
            <h3>Docs</h3>

            <div>
                <h4>Docs Section</h4>
                {docsSection ? (
                    <div>Section ID: {docsSection}</div>
                ) : (
                    <HeadedButton variant={VariantEnum.Outline}>Create Docs Section</HeadedButton>
                )}
            </div>

            <div>
                <h4>Manual Section</h4>
                {manualSection ? (
                    <div>Section ID: {manualSection}</div>
                ) : (
                    <HeadedButton variant={VariantEnum.Outline}>Create Manual Section</HeadedButton>
                )}
            </div>
        </div>
    );
}