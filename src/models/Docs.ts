import {Document, Schema, Types} from 'mongoose';
import {createModel} from "@/lib/utils/createModel";

export interface IDocsSectionOrder {
    docsSection: Types.ObjectId;
    order: number;
    level: number;
    parentSection?: Types.ObjectId;
}

export interface IDocs extends Document {
    project: Types.ObjectId;
    content: string;
    docsSections: IDocsSectionOrder[];
    createdAt: Date;
    updatedAt: Date;
}

const DocsSectionOrderSchema = new Schema<IDocsSectionOrder>({
    docsSection: {type: Schema.Types.ObjectId, ref: 'DocsSection', required: true},
    order: {type: Number, required: true},
    level: {type: Number, required: true, default: 0},
    parentSection: {type: Schema.Types.ObjectId, ref: 'DocsSection'}
});

const DocsSchema = new Schema<IDocs>({
    project: {type: Schema.Types.ObjectId, ref: 'Project', required: true},
    content: {type: String, default: ''},
    docsSections: {type: [DocsSectionOrderSchema], required: true, default: []},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export default createModel<IDocs>('Docs', DocsSchema);