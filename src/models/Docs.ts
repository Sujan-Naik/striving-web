// Docs.ts
import { Schema, model, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IDocs extends Document {
  wiki: Types.ObjectId;
  content: string;
  sections: {
    title: string;
    content: string;
    order: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DocsSchema = new Schema<IDocs>({
  wiki: { type: Schema.Types.ObjectId, ref: 'Wiki', required: true },
  content: { type: String, default: '' },
  sections: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IDocs>('Docs', DocsSchema);