import { useState, useEffect, useCallback } from 'react';

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
  const [newUserId, setNewUserId] = useState('');
  const [newCommitSha, setNewCommitSha] = useState('');
  const [newPrNumber, setNewPrNumber] = useState('');

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/features/${featureId}`);
        if (response.status === 404) {
          setError('Feature not found');
          return;
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feature) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/project/${projectId}/features/${featureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Update failed');

      const updated = await response.json();
      setFeature(updated);
      setFormData(updated);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const addUser = () => {
    if (!newUserId.trim() || !formData.assignedUsers) return;
    setFormData({
      ...formData,
      assignedUsers: [...formData.assignedUsers, newUserId.trim()]
    });
    setNewUserId('');
  };

  const addCommit = () => {
    if (!newCommitSha.trim() || !formData.commitShas) return;
    setFormData({
      ...formData,
      commitShas: [...formData.commitShas, newCommitSha.trim()]
    });
    setNewCommitSha('');
  };

  const addPr = () => {
    const prNum = parseInt(newPrNumber);
    if (!prNum || !formData.pullRequestNumbers) return;
    setFormData({
      ...formData,
      pullRequestNumbers: [...formData.pullRequestNumbers, prNum]
    });
    setNewPrNumber('');
  };

  const removeItem = (type: 'assignedUsers' | 'commitShas' | 'pullRequestNumbers', index: number) => {
    const current = formData[type] as any[];
    if (!current) return;
    setFormData({
      ...formData,
      [type]: current.filter((_, i) => i !== index)
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error && !feature) return <div>Error: {error}</div>;
  if (!feature) return <div>Feature not found</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Feature: {feature.title}</h2>

      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <div>
        <h3>Title</h3>
        <input
          value={formData.title || ''}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          disabled={saving}
          required
        />
      </div>

      <div>
        <h3>Description</h3>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          disabled={saving}
          required
        />
      </div>

      <div>
        <h3>State</h3>
        <select
          value={formData.state || ''}
          onChange={(e) => setFormData({...formData, state: e.target.value})}
          disabled={saving}
        >
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div>
        <h3>Assigned Users</h3>
        <div>
          <input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="User ID"
            disabled={saving}
          />
          <button type="button" onClick={addUser} disabled={saving}>Add</button>
        </div>
        <ul>
          {(formData.assignedUsers || []).map((user, i) => (
            <li key={i}>
              {user}
              <button type="button" onClick={() => removeItem('assignedUsers', i)} disabled={saving}>×</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Commits</h3>
        <div>
          <input
            value={newCommitSha}
            onChange={(e) => setNewCommitSha(e.target.value)}
            placeholder="Commit SHA"
            disabled={saving}
          />
          <button type="button" onClick={addCommit} disabled={saving}>Add</button>
        </div>
        <ul>
          {(formData.commitShas || []).map((sha, i) => (
            <li key={i}>
              {sha}
              <button type="button" onClick={() => removeItem('commitShas', i)} disabled={saving}>×</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Pull Requests</h3>
        <div>
          <input
            type="number"
            value={newPrNumber}
            onChange={(e) => setNewPrNumber(e.target.value)}
            placeholder="PR Number"
            disabled={saving}
          />
          <button type="button" onClick={addPr} disabled={saving}>Add</button>
        </div>
        <ul>
          {(formData.pullRequestNumbers || []).map((pr, i) => (
            <li key={i}>
              #{pr}
              <button type="button" onClick={() => removeItem('pullRequestNumbers', i)} disabled={saving}>×</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Documentation Section</h3>
        <input
          value={formData.docSection || ''}
          onChange={(e) => setFormData({...formData, docSection: e.target.value})}
          disabled={saving}
        />
      </div>

      <div>
        <h3>Wiki Section</h3>
        <input
          value={formData.wikiSection || ''}
          onChange={(e) => setFormData({...formData, wikiSection: e.target.value})}
          disabled={saving}
        />
      </div>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}