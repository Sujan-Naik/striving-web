'use client';

import {useState, useEffect, JSX} from 'react';
import { useProject } from "@/context/ProjectContext";
import DocsSectionDisplay from "@/components/project/docs/section/DocsSectionDisplay";
import { HeadedTabs } from "headed-ui";
import {IDocs, IDocsSectionOrder} from "@/types/project/Docs";
import ReactMarkdown from "react-markdown";

interface SectionNode extends IDocsSectionOrder {
  children: SectionNode[];
}

export default function DocsDisplay() {
  const  project  = useProject()!;
  const projectId = project?._id;
  const [docs, setDocs] = useState<IDocs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/project/${projectId}/docs`);
        if (response.ok) {
          const data = await response.json();
          setDocs(data);
        }
      } catch (error) {
        console.error('Error fetching docs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [projectId]);

  const buildSectionTree = (sections: IDocsSectionOrder[]): SectionNode[] => {
    const sorted = sections.sort((a, b) => a.order - b.order);
    const sectionMap = new Map<string, SectionNode>();

    // Initialize all sections as nodes
    sorted.forEach(section => {
      sectionMap.set(section.docsSection._id, {
        ...section,
        children: []
      });
    });

    const rootSections: SectionNode[] = [];

    // Build the tree structure
    sorted.forEach(section => {
      const node = sectionMap.get(section.docsSection._id)!;

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
    <div key={node.docsSection._id} style={{ marginLeft: `${node.level * 20}px` }}>
      <DocsSectionDisplay section={node.docsSection} />
      {node.children.map(child => renderSectionNode(child))}
    </div>
  );

  const renderTabContent = (rootNode: SectionNode): JSX.Element => (
    <div key={rootNode.docsSection._id}>
      {rootNode.children.map(child => renderSectionNode(child))}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!docs) return <div>No docs found</div>;

  const sectionTree = buildSectionTree(docs.docsSections);
  const topLevelSections = sectionTree.filter(node => node.level === 0);
  const tabTitles = topLevelSections.map(section => section.docsSection.title);

  return (
    <div>
      <div className={"center-column"} style={{ whiteSpace: 'pre-wrap' }}>{docs.content}</div>

      <HeadedTabs tabs={tabTitles}>
        {topLevelSections.map(section =>
            <div>
              <ReactMarkdown>{section.docsSection.content}</ReactMarkdown>
              {renderTabContent(section)}
        </div>
        )}

      </HeadedTabs>
    </div>
  );
}