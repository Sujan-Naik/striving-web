// WikiSection.ts
import { Schema, Document, Types } from 'mongoose';
import { createModel } from "@/lib/utils/createModel";

export interface IWikiSection extends Document {
  feature: Types.ObjectId;
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const WikiSectionSchema = new Schema<IWikiSection>({
  feature: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IWikiSection>('WikiSection', WikiSectionSchema);