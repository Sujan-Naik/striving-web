import {IDocsSection} from "@/types/project/DocsSection";

export interface IDocsSectionOrder {
  docsSection: string;
  order: number;
  level: number;
  parentSection?: string;
}

export interface IDocs {
  _id: string;
  project: string;
  content: string;
  docsSections: IDocsSectionOrder[];
}
