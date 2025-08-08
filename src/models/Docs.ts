// Docs.ts
import { Schema, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IDocs extends Document {
  project: Types.ObjectId;
  content: string;
  documentationSection: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}


const DocsSchema = new Schema<IDocs>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, default: '' },
  documentationSection: {type: [{type: Schema.Types.ObjectId, ref: 'DocumentationSection'}], required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IDocs>('Docs', DocsSchema);