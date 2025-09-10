// Project.ts
import { Schema, model, Document, Types } from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IProject extends Document {
  name: string;
  description: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  githubRepo: string; // owner/repo format
  features: Types.ObjectId[];
  manual: Types.ObjectId[];
  docs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, unique: true},
  description: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  githubRepo: { type: String, required: true }, // e.g., "username/repo-name"
  features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }],
  manual: [{ type: Schema.Types.ObjectId, ref: 'Manual' }],
  docs: [{ type: Schema.Types.ObjectId, ref: 'Docs' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default createModel<IProject>('Project', ProjectSchema);