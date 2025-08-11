import {IManualSection} from "@/types/project/ManualSection";

export interface IManualSectionOrder {
  manualSection: IManualSection;
  order: number;
  level: number;
  parentSection?: IManualSection;
}

export interface IManual {
  project: string;
  content: string;
  manualSections: IManualSectionOrder[];
}
