import {useEffect, useState} from 'react';
import {HeadedButton, HeadedInput, HeadedSelect, HeadedTextArea, VariantEnum} from "headed-ui";

interface Feature {
    _id: string;
    title: string;
    parent?: string;
    children: string[];
}

interface FeatureCreateProps {
    projectId: string;
    onFeatureCreated?: () => void;
}

export default function FeatureCreate({projectId, onFeatureCreated}: FeatureCreateProps) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState('');
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await fetch(`/api/project/${projectId}/features`);
                if (response.ok) {
                    const data = await response.json();
                    setFeatures(data);
                }
            } catch (err) {
                console.error('Failed to fetch features:', err);
            }
        };
        fetchFeatures();
    }, [projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const featureData: any = {title, description};
            if (parentId) featureData.parent = parentId;

            const featureResponse = await fetch(`/api/project/${projectId}/features`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(featureData)
            });

            if (!featureResponse.ok) throw new Error('Failed to create features');


            const feature = await featureResponse.json();

            const docResponse = await fetch(`/api/project/${projectId}/docs-sections`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    feature: feature._id,
                    id: `doc-${feature._id}`,
                    title: `${title} Docs`,
                    content: `Docs for ${title}`,
                    order: 1
                })
            });

            const manualResponse = await fetch(`/api/project/${projectId}/manual-sections`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    feature: feature._id,
                    id: `manual-${feature._id}`,
                    title: `${title} Manual`,
                    content: `Manual content for ${title}`,
                    order: 1
                })
            });

            if (!docResponse.ok || !manualResponse.ok) {
                throw new Error('Failed to create sections');
            }

            const docsSection = await docResponse.json();
            const manualSection = await manualResponse.json();

            await fetch(`/api/project/${projectId}/features/${feature._id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    docsSection: docsSection._id,
                    manualSection: manualSection._id
                })
            });

            setTitle('');
            setDescription('');
            setParentId('');
            onFeatureCreated?.();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={"center-column"}>
            <h3>Create Feature</h3>
            {error && <div>Error: {error}</div>}

            <HeadedInput width={"100%"} variant={VariantEnum.Outline}
                         type="text"
                         placeholder="Feature title"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         required
            />
            <h4>Feature Description</h4>


            <HeadedTextArea
                width={"100%"}
                variant={VariantEnum.Outline}
                placeholder="Feature description"

                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                markdown={false}
                height={'auto'}
                required
            />


            <div>

                <HeadedSelect
                    label="Parent Feature"
                    variant={VariantEnum.Outline}
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    options={[
                        {value: '', label: 'No Parent (Root Feature)'},
                        ...features.map((feature) => ({
                            value: feature._id,
                            label: feature.title,
                        })),
                    ]}
                />


            </div>

            <HeadedButton variant={VariantEnum.Outline} type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Feature'}
            </HeadedButton>
        </form>
    );
}