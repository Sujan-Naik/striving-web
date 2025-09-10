'use client'
import { useState } from 'react';
import {useProject} from "@/context/ProjectContext";

export default function DocsCreate(){
  const [content, setContent] = useState('');

      const project = useProject();


  const handleCreate = async () => {
    await fetch(`/api/project/${project._id}/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, project: project._id })
    });
  };

  return (
    <div>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter content"
      />
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}