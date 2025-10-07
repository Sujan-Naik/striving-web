export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    created_at: string;
    updated_at: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    owner: {
        login: string;
        id: number;
        avatar_url: string;
    };
}

export interface CreateRepoData {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
}