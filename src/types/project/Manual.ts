import {IManualSection} from "@/types/project/ManualSection";

export interface IManualSectionOrder {
  manualSection: string;
  order: number;
  level: number;
  parentSection?: string;
}

export interface IManual {
  _id: string;
  project: string;
  content: string;
  manualSections: IManualSectionOrder[];
}
