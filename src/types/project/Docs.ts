import {IDocsSection} from "@/types/project/DocsSection";

export interface IDocsSectionOrder {
  docsSection: IDocsSection;
  order: number;
  level: number;
  parentSection?: IDocsSection;
}

export interface IDocs {
  project: string;
  content: string;
  docsSections: IDocsSectionOrder[];
}
