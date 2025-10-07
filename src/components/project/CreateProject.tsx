'use client';

import {useState} from 'react';
import {useUser} from "@/context/UserContext";
import {HeadedButton, HeadedInput, HeadedSelect, HeadedTextArea, VariantEnum} from "headed-ui";
import {useGithubRepository} from "@/hooks/useGithubRepository";
import {useRouter} from "next/navigation"; // Update path as needed

interface CreateProjectProps {
    onProjectCreated?: (project: any) => void;
}

export default function CreateProject({onProjectCreated}: CreateProjectProps) {
    const router = useRouter();
    const {user} = useUser();
    const {repos, loading: loadingRepos, error: repoError} = useGithubRepository();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        githubRepo: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/project', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...formData,
                    owner: user!._id,
                    members: [user!._id],
                    docs: [],
                    manual: []
                })
            });

            if (!response.ok) throw new Error('Failed to create project');

            const project = await response.json();

            onProjectCreated?.(project);
            await router.push(`/projects/${project.name}`)
            // setFormData({ name: '', description: '', githubRepo: '' });
        } catch (err) {
            setError('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Display repo error if there's one, otherwise display form error
    const displayError = repoError || error;

    return (
        <form onSubmit={handleSubmit} className={'center-column'}>
            <div>
                <HeadedInput
                    width={"100%"}
                    name="name"
                    placeholder="Project name"
                    value={formData.name}
                    onChange={handleChange}
                    variant={VariantEnum.Outline}
                    required
                />
            </div>

            <div>
                <HeadedTextArea
                    width={"100%"}
                    variant={VariantEnum.Outline}
                    name="description"
                    placeholder="Project description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    markdown={false}
                />
            </div>

            <div>
                <HeadedSelect
                    name="githubRepo"
                    options={[
                        loadingRepos ? 'Loading repositories...' : 'Select a repository',
                        ...repos.map(repo => repo.full_name)
                    ]}
                    label="GitHub Repository"
                    description="Choose a repository to link with your project"
                    onChange={handleChange}
                    variant={VariantEnum.Outline}
                />
            </div>

            {displayError && <div style={{color: 'red'}}>{displayError}</div>}

            <HeadedButton
                variant={VariantEnum.Outline}
                type="submit"
                disabled={loading || loadingRepos}
            >
                {loading ? 'Creating...' : 'Create Project'}
            </HeadedButton>
        </form>
    );
}