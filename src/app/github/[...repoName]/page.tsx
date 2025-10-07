'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import {Repository} from '@/types/github';
import RepoDetails from '@/components/github/RepoDetails/RepoDetails';
import CodeEditor from '@/components/github/CodeEditor/CodeEditor';
import {HeadedLink, VariantEnum} from "headed-ui";

export default function RepoPage() {
    const params = useParams()!;
    const owner = params.repoName![0]
    const repo = params.repoName![1]


    const [repository, setRepository] = useState<Repository | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (owner && repo) {
            loadRepository();
        }
    }, [owner, repo]);

    const loadRepository = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // you may not need user info anymore if supporting arbitrary repos
            const reposResponse = await fetch(`/api/github/${owner}/${repo}`);
            if (!reposResponse.ok) {
                throw new Error(`Failed to fetch repo: ${reposResponse.status}`);
            }
            setRepository(await reposResponse.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!owner || !repo) {
        return (
            <div>
                <p>Invalid repository path</p>
                <Link href="/github">← Back to repositories</Link>
            </div>
        );
    }

    if (isLoading) {
        return <div>Loading repository...</div>;
    }

    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
                <Link href="/github">← Back to repositories</Link>
            </div>
        );
    }

    if (!repository) {
        return (
            <div>
                <p>Repository not found</p>
                <Link href="/github">← Back to repositories</Link>
            </div>
        );
    }

    return (
        <div className={'center-column w-full'}>
            <div className={'flex flex-row w-full center-column'}>
                <HeadedLink variant={VariantEnum.Outline} href="/github">← Back to repositories</HeadedLink>
                <RepoDetails repository={repository}/>
            </div>
            <div className={'w-full'}>
                <CodeEditor owner={owner} repo={repo}/>
            </div>

        </div>
    );
}
