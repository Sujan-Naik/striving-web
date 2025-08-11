import {DocumentationSection} from "@/types/project/DocumentationSection";
import {WikiSection} from "@/types/project/WikiSection";

export interface Feature {
  _id: string;
  title: string;
  description: string;
  state: string;
  assignedUsers: string[];
  commitShas: string[];
  pullRequestNumbers: number[];
  parent?: string;
  children: string[];
  documentationSection?: DocumentationSection;
  wikiSection?: WikiSection;
  createdAt: string;
  updatedAt: string;
}



