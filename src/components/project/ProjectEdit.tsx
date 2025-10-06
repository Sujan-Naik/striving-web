'use client';
import {useState} from 'react';
import {HeadedButton, HeadedInput, HeadedTextArea, VariantEnum} from "headed-ui";
import {useProject} from "@/context/ProjectContext";
import {useRouter} from "next/navigation";


export function ProjectEdit() {
  const project = useProject();
  console.log(project.name)
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [loading, setLoading] = useState(false);
    const router = useRouter()
  const updateProject = async () => {
        if (!name.trim()) return;
    setLoading(true);
    await fetch(`/api/project/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    router.push(`/projects/${name}`)
    setLoading(false);

  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className={"center-column"}>
      <h2 className="text-xl font-semibold mb-4">Edit Project</h2>

      <div className="space-y-4 center-column">
        <div>
          <label className="block mb-2">Name</label>
          <HeadedInput variant={VariantEnum.Primary}
            type="text"
                       value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <HeadedTextArea variant={VariantEnum.Primary}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full"
                          placeholder={project.description}
                          markdown={true}
                          height={'auto'}

          />
        </div>

        <HeadedButton
          variant={VariantEnum.Outline}
          onClick={updateProject}
            disabled={loading || !name.trim()}
        >
          {loading ? 'Updating...' : 'Update Project'}
        </HeadedButton>
      </div>
    </div>
  );
}