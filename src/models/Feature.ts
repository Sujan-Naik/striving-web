// Feature.ts
import {Document, Schema, Types} from 'mongoose';
import {createModel} from "@/lib/utils/createModel";
import DocsSection from "@/models/DocsSection";
import ManualSection from "@/models/ManualSection";

enum FeatureState {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    REVIEW = 'review',
    COMPLETED = 'completed',
    SCRAPPED = 'scrapped'
}

export interface IFeature extends Document {
    title: string;
    description: string;
    project: Types.ObjectId;
    assignedUsers: Types.ObjectId[];
    state: FeatureState;
    commitShas: string[];
    pullRequestNumbers: number[];
    parent?: Types.ObjectId;
    children: Types.ObjectId[];
    docsSection?: Types.ObjectId; // Reference to DocsSection
    manualSection?: Types.ObjectId; // Reference to ManualSection
    createdAt: Date;
    updatedAt: Date;
}

const FeatureSchema = new Schema<IFeature>({
    title: {type: String, required: true},
    description: {type: String, required: true},
    project: {type: Schema.Types.ObjectId, ref: 'Project', required: true},
    assignedUsers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    state: {type: String, enum: Object.values(FeatureState), default: FeatureState.PLANNED},
    commitShas: [String],
    pullRequestNumbers: [Number],
    parent: {type: Schema.Types.ObjectId, ref: 'Feature'},
    children: [{type: Schema.Types.ObjectId, ref: 'Feature'}],
    docsSection: {type: Schema.Types.ObjectId, ref: DocsSection},
    manualSection: {type: Schema.Types.ObjectId, ref: ManualSection},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export default createModel<IFeature>('Feature', FeatureSchema);