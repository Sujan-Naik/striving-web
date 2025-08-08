// Wiki.ts
import { Schema, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IWiki extends Document {
  project: Types.ObjectId;
  content: string;
  wikiSection: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}


const WikiSchema = new Schema<IWiki>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, default: '' },
  wikiSection: {type: [{type: Schema.Types.ObjectId, ref: 'WikiSection'}], required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IWiki>('Wiki', WikiSchema);