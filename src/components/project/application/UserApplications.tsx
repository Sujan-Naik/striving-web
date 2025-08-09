'use client';

import { useState, useEffect } from 'react';

interface UserApplication {
  _id: string;
  project: {
    name: string;
    description: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function UserApplications({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserApplications();
  }, [userId]);

  const fetchUserApplications = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/applications`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch user applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your applications...</div>;

  return (
    <div>
      <h3>My Applications</h3>
      {applications.map((app) => (
        <div key={app._id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem 0' }}>
          <h4>{app.project.name}</h4>
          <p>{app.project.description}</p>
          <div>
            Status: <span style={{ fontWeight: 'bold' }}>{app.status}</span>
          </div>
          <small>{new Date(app.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}