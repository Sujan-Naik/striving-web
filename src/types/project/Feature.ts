import {IDocumentationSection} from "@/types/project/DocumentationSection";
import {IWikiSection} from "@/types/project/WikiSection";

export interface IFeature {
  _id: string;
  title: string;
  description: string;
  state: string;
  assignedUsers: string[];
  commitShas: string[];
  pullRequestNumbers: number[];
  parent?: string;
  children: string[];
  documentationSection: IDocumentationSection;
  wikiSection: IWikiSection;
  createdAt: string;
  updatedAt: string;
}



