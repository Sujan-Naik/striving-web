// Docs.ts
import { Schema, model, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IDocs extends Document {
  project: Types.ObjectId;
  content: string;
  sections: {
    id: string; // Unique section identifier
    title: string;
    content: string;
    order: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}


const DocsSchema = new Schema<IDocs>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, default: '' },
  sections: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IDocs>('Docs', DocsSchema);