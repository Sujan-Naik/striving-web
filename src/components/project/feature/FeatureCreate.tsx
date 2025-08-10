import { useState, useEffect } from 'react';

interface Feature {
  _id: string;
  title: string;
  parent?: string;
  children: string[];
}

interface FeatureCreateProps {
  projectId: string;
  onFeatureCreated?: () => void;
}

export default function FeatureCreate({ projectId, onFeatureCreated }: FeatureCreateProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/features`);
        if (response.ok) {
          const data = await response.json();
          setFeatures(data);
        }
      } catch (err) {
        console.error('Failed to fetch features:', err);
      }
    };
    fetchFeatures();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const featureData: any = { title, description };
      if (parentId) featureData.parent = parentId;

      const featureResponse = await fetch(`/api/project/${projectId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featureData)
      });

      if (!featureResponse.ok) throw new Error('Failed to create feature');

      const feature = await featureResponse.json();

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

      const documentationSection = await docResponse.json();
      const wikiSection = await wikiResponse.json();

      await fetch(`/api/project/${projectId}/features/${feature._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentationSection: documentationSection._id,
          wikiSection: wikiSection._id
        })
      });

      setTitle('');
      setDescription('');
      setParentId('');
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

      <div>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">No Parent (Root Feature)</option>
          {features.map(feature => (
            <option key={feature._id} value={feature._id}>
              {feature.title}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Feature'}
      </button>
    </form>
  );
}