'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {IManualSection} from "@/types/project/ManualSection";
import {HeadedButton, HeadedInput, HeadedTextArea, VariantEnum} from "headed-ui";


export default function ManualSectionEditor({projectId, manualSection}: {projectId: string, manualSection: IManualSection}) {
  const [title, setTitle] = useState(manualSection.title);
  const [content, setContent] = useState(manualSection.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [section, setSection] = useState<IManualSection>(manualSection);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/project/${projectId}/manual-sections/${section._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) throw new Error('Failed to save section');
      const updatedSection = await response.json();
      setSection(updatedSection)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/project/${projectId}/manual-sections/${section._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete section');
      router.push(`/project/${projectId}/manual`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className={"center-column"} style={{width: "100%"}}>
      <HeadedInput width={"100%"} variant={VariantEnum.Outline}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <HeadedTextArea width={"100%"} variant={VariantEnum.Outline}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
                      markdown={true}
      />
      <div>
        <HeadedButton variant={VariantEnum.Outline} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </HeadedButton>
        <HeadedButton variant={VariantEnum.Outline} onClick={handleDelete}>Delete</HeadedButton>
      </div>
    </div>
  );
}