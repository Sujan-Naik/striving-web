// FeatureMapping.ts - Optional dedicated mapping collection
import {Schema, Types} from "mongoose";

export interface IFeatureMapping extends Document {
  feature: Types.ObjectId;
  docSection?: string;
  wikiSection?: string;
  metadata?: Record<string, any>;
}

const FeatureMappingSchema = new Schema<IFeatureMapping>({
  feature: { type: Schema.Types.ObjectId, ref: 'Feature', required: true },
  docSection: String,
  wikiSection: String,
  metadata: Schema.Types.Mixed
});