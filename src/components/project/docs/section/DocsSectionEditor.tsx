'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {IDocsSection} from "@/types/project/DocsSection";
import {HeadedButton, HeadedInput, HeadedModal, HeadedTextArea, VariantEnum} from "headed-ui";

import DocumentationGeneration from "@/components/github/DocumentationGeneration/DocumentationGeneration";
import {useProject} from "@/context/ProjectContext";

export default function DocsSectionEditor({
                                              projectId,
                                              docsSection,
                                              onFeatureUpdate // Add this prop
                                          }: {
    projectId: string;
    docsSection: IDocsSection;
    onFeatureUpdate: () => void; // Add this type
}) {
    const [title, setTitle] = useState(docsSection.title);
    const [content, setContent] = useState(docsSection.content);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDocGenModal, setDocGenModal] = useState(false);
    const router = useRouter();
    const [section, setSection] = useState<IDocsSection>(docsSection);

    // Save section
    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(
                `/api/project/${projectId}/docs-sections/${section._id}`,
                {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({title, content}),
                }
            );
            if (!response.ok) throw new Error('Failed to save section');
            const updatedSection = await response.json();
            setSection(updatedSection);
            onFeatureUpdate(); // Call to refresh project after save
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Delete section
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            const response = await fetch(
                `/api/project/${projectId}/docs-sections/${section._id}`,
                {method: 'DELETE'}
            );
            if (!response.ok) throw new Error('Failed to delete section');
            onFeatureUpdate(); // Call to refresh project before navigation (optional, as delete modifies project)
            router.push(`/project/${projectId}/docs`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    // Handle generated markdown injection
    const handleImportGeneratedDoc = (markdown: string, filePath: string) => {
        setContent(prev =>
            `${prev}\n\n---\n\n### Auto‑Generated Documentation\n**Source:** \`${filePath}\`\n\n${markdown}`
        );
        setDocGenModal(false);
    };

    if (error) return <div>Error: {error}</div>;
    const {project, refreshProject} = useProject();

    const [owner, repo] = project.githubRepo.split('/');

    return (
        <div className="center-column" style={{width: "100%"}}>
            {/* Title */}
            <HeadedInput
                width={"100%"}
                variant={VariantEnum.Outline}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {/* Markdown Editor */}
            <HeadedTextArea
                width={"100%"}
                variant={VariantEnum.Outline}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                markdown={true}
                height={'auto'}
            />

            {/* Toolbar Buttons */}
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <HeadedButton
                    variant={VariantEnum.Outline}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save'}
                </HeadedButton>

                <HeadedButton variant={VariantEnum.Outline} onClick={handleDelete}>
                    Delete
                </HeadedButton>

                <HeadedButton
                    variant={VariantEnum.Primary}
                    onClick={() => setDocGenModal(true)}
                >
                    Generate from Code
                </HeadedButton>
            </div>

            {/* Fullscreen Modal for DocumentationGeneration */}
            <HeadedModal
                isOpen={openDocGenModal}
                onClose={() => setDocGenModal(false)}
                title={'Generate Documentation from Code'}
                variant={VariantEnum.Primary}
            >
                <div style={{
                    display: 'flex',
                    height: 'calc(100vh - 100px)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        flex: 1,
                        borderRight: '1px solid var(--border-color)',
                        overflow: 'auto'
                    }}>
                        <DocumentationGeneration
                            owner={owner}
                            repo={repo}
                            initialBranch="main"
                        />
                    </div>
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '10px'
                    }}>
                        <h3 style={{marginTop: 0}}>Current Doc Section</h3>
                        <HeadedTextArea
                            width={"100%"}
                            variant={VariantEnum.Outline}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={20}
                            markdown={true}
                            height={'auto'}
                        />
                        <div style={{marginTop: '10px', textAlign: 'right'}}>
                            <HeadedButton
                                variant={VariantEnum.Primary}
                                onClick={handleSave}
                            >
                                Save Section
                            </HeadedButton>
                        </div>
                    </div>
                </div>
            </HeadedModal>
        </div>
    );
}