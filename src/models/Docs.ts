import { Schema, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IDocsSection {
  documentationSection: Types.ObjectId;
  order: number;
  level: number;
  parentSection?: Types.ObjectId;
}

export interface IDocs extends Document {
  project: Types.ObjectId;
  content: string;
  documentationSections: IDocsSection[];
  createdAt: Date;
  updatedAt: Date;
}

const DocsSectionSchema = new Schema<IDocsSection>({
  documentationSection: { type: Schema.Types.ObjectId, ref: 'DocumentationSection', required: true },
  order: { type: Number, required: true },
  level: { type: Number, required: true, default: 0 },
  parentSection: { type: Schema.Types.ObjectId, ref: 'DocumentationSection' }
});

const DocsSchema = new Schema<IDocs>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, default: '' },
  documentationSections: { type: [DocsSectionSchema], required: true, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IDocs>('Docs', DocsSchema);