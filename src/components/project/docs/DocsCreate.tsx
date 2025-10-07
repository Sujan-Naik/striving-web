'use client'
import {useState} from 'react';
import {useProject} from "@/context/ProjectContext";
import {HeadedButton, HeadedInput, VariantEnum} from "headed-ui";
import {useRouter} from "next/navigation";

export default function DocsCreate(){
      const router = useRouter();

  const [content, setContent] = useState('');

        const { project, refreshProject } = useProject();


  const handleCreate = async () => {
      if (!content.trim()) return;
    await fetch(`/api/project/${project._id}/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, project: project._id })
    });
    await refreshProject();

  };

  return (
    <div className={'center-column'} style={{width: '100%'}}>
      <HeadedInput
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Name your next Docs"
        variant={VariantEnum.Secondary}
        width={'auto'}
      />
      <HeadedButton variant={VariantEnum.Secondary} onClick={handleCreate} disabled={!content.trim()} >Create</HeadedButton>
    </div>
  );
}