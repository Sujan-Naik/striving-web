'use client';

import { useState } from 'react';
import {useUser} from "@/context/UserContext";
import {HeadedButton, HeadedTextArea, VariantEnum} from "headed-ui";

interface ApplyToProjectProps {
  projectId: string;
  hasApplied: boolean;
  onApplicationSubmit: () => void;
}

export default function ApplyToProject({ projectId, hasApplied, onApplicationSubmit }: ApplyToProjectProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const {user} = useUser();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/project/${projectId}/applications/${user!._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        onApplicationSubmit();
        setMessage('');
      }
    } catch (error) {
      console.error('Failed to applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (hasApplied) {
    return <p>Application submitted</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <HeadedTextArea width={"100%"} variant={VariantEnum.Outline}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Why do you want to contribute?"
        rows={3}
      />
      <HeadedButton variant={VariantEnum.Outline} type="submit" disabled={loading}>
        {loading ? 'Applying...' : 'Apply to Project'}
      </HeadedButton>
    </form>
  );
}