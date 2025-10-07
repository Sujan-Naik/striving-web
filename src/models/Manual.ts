import {Document, Schema, Types} from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IManualSectionOrder {
    manualSection: Types.ObjectId;
    order: number;
    level: number;
    parentSection?: Types.ObjectId;
}

export interface IManual extends Document {
    project: Types.ObjectId;
    content: string;
    manualSections: IManualSectionOrder[];
    createdAt: Date;
    updatedAt: Date;
}

const ManualSectionOrderSchema = new Schema<IManualSectionOrder>({
    manualSection: {type: Schema.Types.ObjectId, ref: 'ManualSection', required: true},
    order: {type: Number, required: true},
    level: {type: Number, required: true, default: 0},
    parentSection: {type: Schema.Types.ObjectId, ref: 'ManualSection'}
});

const ManualSchema = new Schema<IManual>({
    project: {type: Schema.Types.ObjectId, ref: 'Project', required: true},
    content: {type: String, default: ''},
    manualSections: {type: [ManualSectionOrderSchema], required: true, default: []},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export default createModel<IManual>('Manual', ManualSchema);