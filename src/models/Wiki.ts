// Wiki.ts
import { Schema, model, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IWiki extends Document {
  project: Types.ObjectId;
  title: string;
  description: string;
  content: string;
  sections: {
    id: string; // Unique section identifier
    title: string;
    content: string;
    order: number;
  }[];
  features: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WikiSchema = new Schema<IWiki>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  sections: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true }
  }],
  features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IWiki>('Wiki', WikiSchema);