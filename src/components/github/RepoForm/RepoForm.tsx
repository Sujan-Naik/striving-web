'use client';

import { useState } from 'react';
import { CreateRepoData } from '@/types/github';
import styles from '@/styles/RepoForm.module.css';

interface RepoFormProps {
  onSubmit: (data: CreateRepoData) => Promise<void>;
  isLoading: boolean;
}

export default function RepoForm({ onSubmit, isLoading }: RepoFormProps) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name">Repository Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles.checkbox}>
        <input
          id="private"
          name="private"
          type="checkbox"
          checked={formData.private}
          onChange={handleChange}
        />
        <label htmlFor="private">Private repository</label>
      </div>

      <div className={styles.checkbox}>
        <input
          id="auto_init"
          name="auto_init"
          type="checkbox"
          checked={formData.auto_init}
          onChange={handleChange}
        />
        <label htmlFor="auto_init">Initialize with README</label>
      </div>

      <button type="submit" disabled={isLoading} className={styles.submit}>
        {isLoading ? 'Creating...' : 'Create Repository'}
      </button>
    </form>
  );
}