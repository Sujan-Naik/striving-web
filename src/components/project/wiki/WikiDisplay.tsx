'use client';

import {useState, useEffect, JSX} from 'react';
import { useProject } from "@/context/ProjectContext";
import WikiSectionDisplay from "@/components/project/wiki/section/WikiSectionDisplay";
import { HeadedTabs } from "headed-ui";

interface IWikiSection {
  wikiSection: wikiSection;
  order: number;
  level: number;
  parentSection?: string;
}

export interface wikiSection {
  _id: string;
  title: string;
  content: string;
  order: number;
}

interface WikiData {
  _id?: string;
  content: string;
  wikiSections: IWikiSection[];
}

interface SectionNode extends IWikiSection {
  children: SectionNode[];
}

export default function WikiDisplay() {
  const { project } = useProject();
  const projectId = project?._id;
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWiki = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/project/${projectId}/wiki`);
        if (response.ok) {
          const data = await response.json();
          setWiki(data);
        }
      } catch (error) {
        console.error('Error fetching wiki:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWiki();
  }, [projectId]);

  const buildSectionTree = (sections: IWikiSection[]): SectionNode[] => {
    const sorted = sections.sort((a, b) => a.order - b.order);
    const sectionMap = new Map<string, SectionNode>();

    // Initialize all sections as nodes
    sorted.forEach(section => {
      sectionMap.set(section.wikiSection._id, {
        ...section,
        children: []
      });
    });

    const rootSections: SectionNode[] = [];

    // Build the tree structure
    sorted.forEach(section => {
      const node = sectionMap.get(section.wikiSection._id)!;

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
    <div key={node.wikiSection._id} style={{ marginLeft: `${node.level * 20}px` }}>
      <WikiSectionDisplay section={node.wikiSection} />
      {node.children.map(child => renderSectionNode(child))}
    </div>
  );

  const renderTabContent = (rootNode: SectionNode): JSX.Element => (
    <div key={rootNode.wikiSection._id}>
      {rootNode.children.map(child => renderSectionNode(child))}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!wiki) return <div>No wiki found</div>;

  const sectionTree = buildSectionTree(wiki.wikiSections);
  const topLevelSections = sectionTree.filter(node => node.level === 0);
  const tabTitles = topLevelSections.map(section => section.wikiSection.title);

  return (
    <div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{wiki.content}</div>

      <HeadedTabs tabs={tabTitles}>
        {topLevelSections.map(section =>
            <div>
              <p> {section.wikiSection.content} </p>
              {renderTabContent(section)}
        </div>
        )}

      </HeadedTabs>
    </div>
  );
}