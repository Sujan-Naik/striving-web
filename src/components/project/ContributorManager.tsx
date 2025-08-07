'use client';
import { useState, useEffect } from 'react';

interface Contributor {
  _id: string;
  username: string;
  email: string;
}

interface Props {
  projectId: string;
}

export function ContributorManager({ projectId }: Props) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [newContributorId, setNewContributorId] = useState('');

  useEffect(() => {
    fetchContributors();
  }, [projectId]);

  const fetchContributors = async () => {
    const res = await fetch(`/api/project/${projectId}/contributors`);
    const data = await res.json();
    setContributors(data);
  };

  const addContributor = async () => {
    await fetch(`/api/project/${projectId}/contributors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributorId: newContributorId })
    });
    setNewContributorId('');
    fetchContributors();
  };

  const removeContributor = async (contributorId: string) => {
    await fetch(`/api/project/${projectId}/contributors`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributorId })
    });
    fetchContributors();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contributors</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Contributor ID"
          value={newContributorId}
          onChange={(e) => setNewContributorId(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={addContributor} className="bg-blue-500 text-white px-4 py-2">
          Add
        </button>
      </div>

      <div className="space-y-2">
        {contributors.map(contributor => (
          <div key={contributor._id} className="flex justify-between items-center border p-2">
            <span>{contributor.username} ({contributor.email})</span>
            <button
              onClick={() => removeContributor(contributor._id)}
              className="bg-red-500 text-white px-2 py-1 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}