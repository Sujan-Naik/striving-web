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

export function ContributorDisplay({ projectId }: Props) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [newContributorId, setNewContributorId] = useState('');

  useEffect(() => {
    fetchContributors();
  }, [projectId]);

  const fetchContributors = async () => {
    const res = await fetch(`/api/project/${projectId}/contributors`);
    const data = await res.json();
        console.log(data)

    setContributors(data);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contributors</h2>


      <div className="space-y-2">
        {contributors.map(contributor => (
          <div key={contributor._id} className="flex justify-between items-center border p-2">
            <span>{contributor.username} ({contributor.email})</span>
          </div>
        ))}
      </div>
    </div>
  );
}