'use client';

import {useState, useEffect, JSX} from 'react';
import { useProject } from "@/context/ProjectContext";
import ManualSectionDisplay from "@/components/project/manual/section/ManualSectionDisplay";
import { HeadedTabs } from "headed-ui";
import {IManual, IManualSectionOrder} from "@/types/project/Manual";
import {useManual} from "@/context/ManualContext";

interface SectionNode extends IManualSectionOrder {
  children: SectionNode[];
}

export default function ManualDisplay() {
  const  project  = useProject()!;
  const projectId = project?._id;
  const [manual, setManual] = useState<IManual | null>(useManual().manual);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManual = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/project/${projectId}/manual`);
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
  }, [projectId]);

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
    <div key={node.manualSection._id} style={{ marginLeft: `${node.level * 20}px` }}>
      <ManualSectionDisplay section={node.manualSection} />
      {node.children.map(child => renderSectionNode(child))}
    </div>
  );

  const renderTabContent = (rootNode: SectionNode): JSX.Element => (
    <div key={rootNode.manualSection._id}>
      {rootNode.children.map(child => renderSectionNode(child))}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!manual) return <div>No manual found</div>;

  const sectionTree = buildSectionTree(manual.manualSections);
  const topLevelSections = sectionTree.filter(node => node.level === 0);
  const tabTitles = topLevelSections.map(section => section.manualSection.title);

  return (
    <div>
      <div className={"center-column"} style={{ whiteSpace: 'pre-wrap' }}>{manual.content}</div>

      <HeadedTabs tabs={tabTitles}>
        {topLevelSections.map(section =>
            <div>
              <p> {section.manualSection.content} </p>
              {renderTabContent(section)}
        </div>
        )}

      </HeadedTabs>
    </div>
  );
}