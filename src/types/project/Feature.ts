import {IDocsSection} from "@/types/project/DocsSection";
import {IManualSection} from "@/types/project/ManualSection";

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
    docsSection: IDocsSection;
    manualSection: IManualSection;
    createdAt: string;
    updatedAt: string;
}



