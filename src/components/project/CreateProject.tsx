'use client';

import {useEffect, useState} from 'react';
import {useUser} from "@/context/UserContext";
import {HeadedButton, HeadedInput, HeadedSelect, HeadedTextArea, VariantEnum} from "headed-ui";

interface CreateProjectProps {
  onProjectCreated?: (project: any) => void;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
}

export default function CreateProject({ onProjectCreated }: CreateProjectProps) {
  const {user} = useUser();

  if (!user){
    return (<div>
      User not logged in
    </div>)
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubRepo: ''
  });
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepositories = async () => {
      setLoadingRepos(true);
      try {
        const response = await fetch('/api/github/repos');
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const repos = await response.json();
        setRepositories(repos);
        console.log(repos)
      } catch (err) {
        setError('Failed to load repositories');
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepositories();
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          owner: user._id,
          members: [user._id]
        })
      });

      if (!response.ok) throw new Error('Failed to create project');


      const project = await response.json();

      await fetch(`/api/project/${project._id}/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Explain the purpose of this project', project: project._id })
      });

      await fetch(`/api/project/${project._id}/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Explain the purpose of this project', project: project._id })
      });


      onProjectCreated?.(project);
      setFormData({ name: '', description: '', githubRepo: '' });
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <HeadedInput width={"100%"}
          name="name"
          placeholder="Project name"
          value={formData.name}
          onChange={handleChange}
          variant={VariantEnum.Outline}
          required
        />
      </div>

      <div>
        <HeadedTextArea width={"100%"}
            variant={VariantEnum.Outline}
          name="description"
          placeholder="Project description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <HeadedSelect
            name="githubRepo"
          options={[
            loadingRepos ? 'Loading repositories...' : 'Select a repository',
            ...repositories.map(repo => repo.full_name)
          ]}
          label="GitHub Repository"
          description="Choose a repository to link with your project"
          onChange={handleChange}
          variant={VariantEnum.Outline}
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <HeadedButton variant={VariantEnum.Outline} type="submit" disabled={loading || loadingRepos}>
        {loading ? 'Creating...' : 'Create Project'}
      </HeadedButton>
    </form>
  );
}