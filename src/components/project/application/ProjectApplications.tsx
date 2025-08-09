'use client';

import { useState, useEffect } from 'react';

interface Application {
  _id: string;
  applicant: {
    username: string;
    email: string;
    avatarUrl?: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface ProjectApplicationsProps {
  projectId: string;
}

export default function ProjectApplications({ projectId }: ProjectApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/applications`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await fetch(`/api/project/${projectId}/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status })
      });
      fetchApplications();
    } catch (error) {
      console.error('Failed to update application:', error);
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div>
      <h3>Applications ({applications.length})</h3>
      {applications.map((app) => (
        <div key={app._id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem 0' }}>
          <div>
            <strong>{app.applicant.username}</strong>
            <span style={{ marginLeft: '1rem', color: '#666' }}>
              {new Date(app.createdAt).toLocaleDateString()}
            </span>
          </div>
          {app.message && <p>{app.message}</p>}
          <div>
            Status: <span style={{ fontWeight: 'bold' }}>{app.status}</span>
          </div>
          {app.status === 'pending' && (
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => handleStatusUpdate(app._id, 'accepted')}>
                Accept
              </button>
              <button onClick={() => handleStatusUpdate(app._id, 'rejected')}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}