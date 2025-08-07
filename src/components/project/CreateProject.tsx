'use client';

import { useState } from 'react';
import {useSession} from "next-auth/react";
import {useUser} from "@/context/UserContext";

interface CreateProjectProps {
  onProjectCreated?: (project: any) => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          // owner: ownerId
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <input
          name="githubRepo"
          placeholder="GitHub repo (username/repo-name)"
          value={formData.githubRepo}
          onChange={handleChange}
          required
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}