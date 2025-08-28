import React, { useState, useEffect } from 'react';
import { GitPullRequest } from '@/types/project/features';

interface PullRequestsListProps {
  projectId: string;
  githubRepo: string;
  featureId: string;
  pullRequestNumbers: number[];
  onUpdate: (endpoint: string, data: any) => void;
}

export default function PullRequestsList({
  projectId,
  featureId,
    githubRepo,
  pullRequestNumbers,
  onUpdate
}: PullRequestsListProps) {
  const [availablePRs, setAvailablePRs] = useState<GitPullRequest[]>([]);
  const [selectedPRs, setSelectedPRs] = useState<GitPullRequest[]>([]);

  useEffect(() => {
    fetchAvailablePRs();
  }, [projectId]);

  useEffect(() => {
    if (pullRequestNumbers.length && availablePRs.length) {
      setSelectedPRs(availablePRs.filter(pr => pullRequestNumbers.includes(pr.number)));
    }
  }, [pullRequestNumbers, availablePRs]);

  const fetchAvailablePRs = async () => {
    try {
      const response = await fetch(`/api/github/${githubRepo}/pull-requests`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePRs(data);
      }
    } catch (err) {
      console.error('Failed to fetch pull requests:', err);
    }
  };

  const handleAddPR = (prNumber: number) => {
    const endpoint = `pull-requests`;
    onUpdate(endpoint, { prNumber, action: 'add' });
  };

  const handleRemovePR = (prNumber: number) => {
    const endpoint = `pull-requests`;
    onUpdate(endpoint, { prNumber, action: 'remove' });
  };

  return (
    <div>
      <h4>Selected Pull Requests</h4>
      {selectedPRs.map(pr => (
        <div key={pr.number}>
          <span>#{pr.number}: {pr.title} ({pr.state})</span>
          <HeadedButton variant={VariantEnum.Outline} onClick={() => handleRemovePR(pr.number)}>Remove</HeadedButton>
        </div>
      ))}

      <h4>Available Pull Requests</h4>
      <select onChange={(e) => handleAddPR(parseInt(e.target.value))}>
        <option value="">Select PR to add</option>
        {availablePRs
          .filter(pr => !pullRequestNumbers.includes(pr.number))
          .map(pr => (
            <option key={pr.number} value={pr.number}>
              #{pr.number}: {pr.title}
            </option>
          ))}
      </select>
    </div>
  );
}