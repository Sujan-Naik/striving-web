import { useState } from 'react';

interface FeatureCreateProps {
  projectId: string;
  onFeatureCreated?: () => void;
}

export default function FeatureCreate({ projectId, onFeatureCreated }: FeatureCreateProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create feature
      const featureResponse = await fetch(`/api/project/${projectId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });

      if (!featureResponse.ok) throw new Error('Failed to create feature');

      const feature = await featureResponse.json();

      // Create documentation section
      const docResponse = await fetch(`/api/project/${projectId}/documentation-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: feature._id,
          id: `doc-${feature._id}`,
          title: `${title} Documentation`,
          content: `Documentation for ${title}`,
          order: 1
        })
      });

      // Create wiki section
      const wikiResponse = await fetch(`/api/project/${projectId}/wiki-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: feature._id,
          id: `wiki-${feature._id}`,
          title: `${title} Wiki`,
          content: `Wiki content for ${title}`,
          order: 1
        })
      });

      if (!docResponse.ok || !wikiResponse.ok) {
        throw new Error('Failed to create sections');
      }

      const docSection = await docResponse.json();
      const wikiSection = await wikiResponse.json();

      // Update feature with section references
      await fetch(`/api/project/${projectId}/features/${feature._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docSection: docSection._id,
          wikiSection: wikiSection._id
        })
      });

      setTitle('');
      setDescription('');
      onFeatureCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Feature</h3>
      {error && <div>Error: {error}</div>}

      <div>
        <input
          type="text"
          placeholder="Feature title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <textarea
          placeholder="Feature description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Feature'}
      </button>
    </form>
  );
}