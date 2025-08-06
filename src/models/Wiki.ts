// Wiki.ts
import { Schema, model, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IWiki extends Document {
  project: Types.ObjectId;
  title: string;
  description: string;
  content: string;
  features: Types.ObjectId[];
  docs: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WikiSchema = new Schema<IWiki>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }],
  docs: { type: Schema.Types.ObjectId, ref: 'Docs' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IWiki>('Wiki', WikiSchema);