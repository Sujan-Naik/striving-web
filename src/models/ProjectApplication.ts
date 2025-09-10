import { Schema, model, models, Document } from 'mongoose';

export interface IProjectApplication extends Document {
  project: Schema.Types.ObjectId;
  applicant: Schema.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectApplicationSchema = new Schema<IProjectApplication>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate applications
ProjectApplicationSchema.index({ project: 1, applicant: 1 }, { unique: true });

export default models.ProjectApplication || model<IProjectApplication>('ProjectApplication', ProjectApplicationSchema);