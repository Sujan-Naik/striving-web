'use client';

import { useState, useEffect } from 'react';
import {useSession} from "next-auth/react";
import {useUser} from "@/context/UserContext";

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
          owner: user._id
        })
      });

      if (!response.ok) throw new Error('Failed to create project');

      const project = await response.json();
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
        <input
          name="name"
          placeholder="Project name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <textarea
          name="description"
          placeholder="Project description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <select
          name="githubRepo"
          value={formData.githubRepo}
          onChange={handleChange}
          required
          disabled={loadingRepos}
        >
          <option value="">
            {loadingRepos ? 'Loading repositories...' : 'Select a repository'}
          </option>
          {repositories.map(repo => (
            <option key={repo.id} value={repo.full_name}>
              {repo.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={loading || loadingRepos}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}