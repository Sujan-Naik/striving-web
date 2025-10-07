'use client';

import {JSX, useEffect, useState} from 'react';
import {useProject} from "@/context/ProjectContext";
import ManualSectionDisplay from "@/components/project/manual/section/ManualSectionDisplay";
import {HeadedCard, HeadedTabs, VariantEnum} from "headed-ui";
import {IManual, IManualSectionOrder} from "@/types/project/Manual";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


interface SectionNode extends IManualSectionOrder {
  children: SectionNode[];
}

export default function ManualDisplay() {
  const  {project}  = useProject();
  const [manual, setManual] = useState<IManual | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManual = async () => {
      if (!project._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/project/${project._id}/manual`);
        if (response.ok) {
          const data = await response.json();
          setManual(data);
        }
      } catch (error) {
        console.error('Error fetching manual:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManual();
  }, [project]);

  const buildSectionTree = (sections: IManualSectionOrder[]): SectionNode[] => {
    const sorted = sections.sort((a, b) => a.order - b.order);
    const sectionMap = new Map<string, SectionNode>();

    // Initialize all sections as nodes
    sorted.forEach(section => {
      sectionMap.set(section.manualSection._id, {
        ...section,
        children: []
      });
    });

    const rootSections: SectionNode[] = [];

    // Build the tree structure
    sorted.forEach(section => {
      const node = sectionMap.get(section.manualSection._id)!;

      if (section.parentSection) {
        const parent = sectionMap.get(section.parentSection._id);
        if (parent) {
          parent.children.push(node);
        } else {
          rootSections.push(node);
        }
      } else {
        rootSections.push(node);
      }
    });

    return rootSections;
  };

  const renderSectionNode = (node: SectionNode): JSX.Element => (
    <div  className={'indented-block'} key={node.manualSection._id} style={{ marginLeft: `${node.level * 20}px`, display: 'block' }}>
      <ManualSectionDisplay section={node.manualSection} />
      {node.children.map(child => renderSectionNode(child))}
    </div>
  );

  const renderTabContent = (rootNode: SectionNode): JSX.Element => (
    <div key={rootNode.manualSection._id} >
      {rootNode.children.map(child => renderSectionNode(child))}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!manual) return <div>No manual found</div>;

  const sectionTree = buildSectionTree(manual.manualSections);
  const topLevelSections = sectionTree.filter(node => node.level === 0);
  const tabTitles = topLevelSections.map(section => section.manualSection.title);

  return (
    <div className={'indented-block'}>
      <HeadedCard variant={VariantEnum.Primary} className={"center-column"} style={{ whiteSpace: 'pre-wrap'}}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{manual.content}</ReactMarkdown>
      </HeadedCard>

      <HeadedTabs tabs={tabTitles}>
        {topLevelSections.map(section =>
            <div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.manualSection.content}</ReactMarkdown>
              {renderTabContent(section)}
        </div>
        )}

      </HeadedTabs>
    </div>
  );
}