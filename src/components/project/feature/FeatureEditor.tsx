import React, { useState, useEffect } from 'react';
import DocumentationSectionEditor from "@/components/project/docs/section/DocumentationSectionEditor";
import WikiSectionEditor from "@/components/project/wiki/section/WikiSectionEditor";

interface Feature {
  _id: string;
  title: string;
  description: string;
  state: string;
  assignedUsers: string[];
  commitShas: string[];
  pullRequestNumbers: number[];
  docSection?: string;
  wikiSection?: string;
}

interface FeatureEditorProps {
  projectId: string;
  featureId: string;
}

export default function FeatureEditor({ projectId, featureId }: FeatureEditorProps) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState<Partial<Feature>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/features/${featureId}`);
        if (!response.ok) throw new Error('Failed to fetch feature');
        const data = await response.json();
        setFeature(data);
        setFormData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeature();
  }, [projectId, featureId]);

  const updateFeature = async (endpoint: string | null, data: any) => {
    setSaving(true);
    try {
      const url = endpoint
        ? `/api/project/${projectId}/features/${featureId}/${endpoint}`
        : `/api/project/${projectId}/features/${featureId}`;

      const response = await fetch(url, {
        method: endpoint ? 'PUT' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
        setFeature(updated);
        setFormData(updated);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = () => {
    const { title, description, state } = formData;
    updateFeature(null, { title, description, state });
  };

  if (loading) return <div>Loading...</div>;
  if (!feature) return <div>Feature not found</div>;

  return (
    <div>
      <h2>Edit Feature: {feature.title}</h2>
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <div>
        <h3>Title</h3>
        <input
          value={formData.title || ''}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          disabled={saving}
        />
        <button onClick={() => updateFeature(null, { title: formData.title })}>
          Update Title
        </button>
      </div>

      <div>
        <h3>Description</h3>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          disabled={saving}
        />
        <button onClick={() => updateFeature(null, { description: formData.description })}>
          Update Description
        </button>
      </div>

      <div>
        <h3>State</h3>
        <select
          value={formData.state || ''}
          onChange={(e) => {
            const newState = e.target.value;
            setFormData({...formData, state: newState});
            updateFeature('state', { state: newState });
          }}
          disabled={saving}
        >
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div>
        <h3>Assign Users</h3>
        <input
          placeholder="User ID"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              updateFeature('assign-users', { userId: e.currentTarget.value });
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <div>
        <h3>Add Commit</h3>
        <input
          placeholder="Commit SHA"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              updateFeature('commits', { commitSha: e.currentTarget.value });
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <div>
        <h3>Add Pull Request</h3>
        <input
          type="number"
          placeholder="PR Number"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              updateFeature('pull-requests', { prNumber: parseInt(e.currentTarget.value) });
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <button onClick={handleBulkUpdate} disabled={saving}>
        Update All Basic Fields
      </button>

      <div>
        <h3>Documentation Section</h3>
        <DocumentationSectionEditor projectId={projectId} sectionId={feature.docSection!}/>
      </div>

      <div>
        <h3>Wiki Section</h3>
        <WikiSectionEditor projectId={projectId} sectionId={feature.wikiSection!}/>
      </div>


    </div>
  );
}