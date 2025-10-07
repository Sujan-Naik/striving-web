'use client';

import {useState} from 'react';
import {CreateRepoData} from '@/types/github';
import {HeadedButton, HeadedInput, HeadedTextArea, VariantEnum} from "headed-ui";

interface RepoFormProps {
    onSubmit: (data: CreateRepoData) => Promise<void>;
    isLoading: boolean;
}

export default function RepoForm({onSubmit, isLoading}: RepoFormProps) {
    const [formData, setFormData] = useState<CreateRepoData>({
        name: '',
        description: '',
        private: false,
        auto_init: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                maxWidth: '500px',
                margin: '0 auto',
            }}
            className={'center-column p-6'}
        >
            {/* Repository Name */}
            <div style={{marginBottom: '1rem'}} className={'center-column'}>
                <label
                    htmlFor="name"
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                    }}
                >
                    Repository Name *
                </label>
                <HeadedInput
                    variant={VariantEnum.Outline}

                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}
                />
            </div>

            {/* Description */}
            <div style={{marginBottom: '1rem'}}>
                <label
                    htmlFor="description"
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                    }}
                >
                    Description
                </label>
                <HeadedTextArea
                    variant={VariantEnum.Outline}
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange} markdown={false}/>
            </div>

            {/* Private checkbox */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                }}
            >
                <input
                    id="private"
                    name="private"
                    type="checkbox"
                    checked={formData.private}
                    onChange={handleChange}
                    style={{
                        marginRight: '0.5rem',
                    }}
                />
                <label htmlFor="private">Private repository</label>
            </div>

            {/* Auto init checkbox */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                }}
            >
                <HeadedInput
                    variant={VariantEnum.Outline}

                    id="auto_init"
                    name="auto_init"
                    type="checkbox"
                    checked={formData.auto_init}
                    onChange={handleChange}
                    style={{
                        marginRight: '0.5rem',
                    }}
                />
                <label htmlFor="auto_init">Initialize with README</label>
            </div>

            {/* Submit button */}
            <HeadedButton
                variant={VariantEnum.Outline}
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? 'Creating...' : 'Create Repository'}
            </HeadedButton>
        </form>
    );
}
