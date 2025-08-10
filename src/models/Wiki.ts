import { Schema, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IWikiSection {
  wikiSection: Types.ObjectId;
  order: number;
  level: number;
  parentSection?: Types.ObjectId;
}

export interface IWiki extends Document {
  project: Types.ObjectId;
  content: string;
  wikiSections: IWikiSection[];
  createdAt: Date;
  updatedAt: Date;
}

const WikiSectionSchema = new Schema<IWikiSection>({
  wikiSection: { type: Schema.Types.ObjectId, ref: 'WikiSection', required: true },
  order: { type: Number, required: true },
  level: { type: Number, required: true, default: 0 },
  parentSection: { type: Schema.Types.ObjectId, ref: 'WikiSection' }
});

const WikiSchema = new Schema<IWiki>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, default: '' },
  wikiSections: { type: [WikiSectionSchema], required: true, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IWiki>('Wiki', WikiSchema);