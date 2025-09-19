'use client'
import {useSession} from "next-auth/react";
import {UserProvider, useUser} from "@/context/UserContext";
import React, {useState} from "react";
import {ProjectProvider, useProject} from "@/context/ProjectContext";
import {ProjectMenu} from "@/components/project/ProjectMenu";
import {HeadedCard, HeadedSwitch, VariantEnum} from "headed-ui";

function LayoutContent({ editor, preview }: {editor: React.ReactNode, preview: React.ReactNode }) {
  const project = useProject();

  const {user} = useUser();
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  if (!project) return <div>No project found</div>;

  const isOwner = project.owner._id === user?._id;

  if (isOwner) {
    const bothVisible = showEditor && showPreview;

    return (
      <div style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexShrink: 0 }}>
          <ProjectMenu/>
        </div>

                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <HeadedCard variant={VariantEnum.Outline} width={'50%'} style={{display: 'flex', justifyContent: 'center'}}>
                            <HeadedSwitch checked={showEditor} onChange={setShowEditor} variant={VariantEnum.Secondary}/>
                      </HeadedCard>
                      <HeadedCard variant={VariantEnum.Outline} width={'50%'} style={{display: 'flex', justifyContent: 'center'}}>
                        <HeadedSwitch checked={showPreview} onChange={setShowPreview} variant={VariantEnum.Secondary}/>
                      </HeadedCard>
                  </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {showEditor && (
            <div style={{
              width: bothVisible ? '50vw' : '100%',
              borderRight: bothVisible ? '1px solid #ccc' : 'none',
              display: 'flex',
              justifyContent: 'center',
                overflowY: 'auto',
                height: '90vh',
                padding: '5px'
            }}>
              {editor}
            </div>
          )}

          {showPreview && (
            <div style={{
              width: bothVisible ? '50vw' : '100%',
              display: 'flex',
              justifyContent: 'center',
                overflowY: 'auto',
                height: '90vh',
                padding: '5px'
            }}>
              {preview}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <ProjectMenu />
        <div style={{ width: '50%' }}>
          {preview}
        </div>
      </div>
    </div>
  );
}

export default function Layout({
  editor,
  preview,
  params
}: {
  children: React.ReactNode;
  editor: React.ReactNode;
  preview: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
    const { data: session, status } = useSession();

    const { projectId } = React.use(params);

  if (status === "loading") return <div>Loading...</div>;
  if (!session?.user?.name) {
      return (

        <ProjectProvider projectId={projectId}>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flexShrink: 0 }}>
              </div>
              <div style={{ flex: 1, display: 'flex' }}>
                <ProjectMenu />
                <div style={{ width: '50%' }}>
                  {preview}
                </div>
              </div>
            </div>
          );
        </ProjectProvider>
  );
  }


  return (
          <UserProvider username={session.user.name}>
        <ProjectProvider projectId={projectId}>
          <LayoutContent editor={editor} preview={preview}/>
        </ProjectProvider>
          </UserProvider>
  );
}