'use client';

import {useState, useEffect, JSX} from 'react';
import { useProject } from "@/context/ProjectContext";
import DocumentationSectionDisplay from "@/components/project/docs/section/DocumentationSectionDisplay";
import { HeadedTabs } from "headed-ui";

interface IDocsSection {
  documentationSection: documentationSection;
  order: number;
  level: number;
  parentSection?: string;
}

export interface documentationSection {
  _id: string;
  title: string;
  content: string;
  order: number;
}

interface DocumentationData {
  _id?: string;
  content: string;
  documentationSections: IDocsSection[];
}

interface SectionNode extends IDocsSection {
  children: SectionNode[];
}

export default function DocsDisplay() {
  const { project } = useProject();
  const projectId = project?._id;
  const [documentation, setDocumentation] = useState<DocumentationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentation = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/project/${projectId}/docs`);
        if (response.ok) {
          const data = await response.json();
          setDocumentation(data);
        }
      } catch (error) {
        console.error('Error fetching documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, [projectId]);

  const buildSectionTree = (sections: IDocsSection[]): SectionNode[] => {
    const sorted = sections.sort((a, b) => a.order - b.order);
    const sectionMap = new Map<string, SectionNode>();

    // Initialize all sections as nodes
    sorted.forEach(section => {
      sectionMap.set(section.documentationSection._id, {
        ...section,
        children: []
      });
    });

    const rootSections: SectionNode[] = [];

    // Build the tree structure
    sorted.forEach(section => {
      const node = sectionMap.get(section.documentationSection._id)!;

      if (section.parentSection) {
        const parent = sectionMap.get(section.parentSection);
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
    <div key={node.documentationSection._id} style={{ marginLeft: `${node.level * 20}px` }}>
      <DocumentationSectionDisplay section={node.documentationSection} />
      {node.children.map(child => renderSectionNode(child))}
    </div>
  );

  const renderTabContent = (rootNode: SectionNode): JSX.Element => (
    <div key={rootNode.documentationSection._id}>
      {rootNode.children.map(child => renderSectionNode(child))}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!documentation) return <div>No documentation found</div>;

  const sectionTree = buildSectionTree(documentation.documentationSections);
  const topLevelSections = sectionTree.filter(node => node.level === 0);
  const tabTitles = topLevelSections.map(section => section.documentationSection.title);

  return (
    <div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{documentation.content}</div>

      <HeadedTabs tabs={tabTitles}>
        {topLevelSections.map(section =>
            <div>
              <p> {section.documentationSection.content} </p>
              {renderTabContent(section)}
        </div>
        )}

      </HeadedTabs>
    </div>
  );
}