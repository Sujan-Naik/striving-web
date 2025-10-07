// manualSectionService.ts
import ManualSection, {IManualSection} from '@/models/ManualSection';
import {Types} from 'mongoose';

export class ManualSectionService {
    async create(data: Partial<IManualSection>): Promise<IManualSection> {
        const section = new ManualSection(data);
        return await section.save();
    }

    async findById(id: string): Promise<IManualSection | null> {
        return await ManualSection.findById(id).populate('feature');
    }

    async findByFeature(featureId: string | Types.ObjectId): Promise<IManualSection[]> {
        return await ManualSection.find({feature: featureId}).sort({order: 1});
    }

    async update(id: string, data: Partial<IManualSection>): Promise<IManualSection | null> {
        return await ManualSection.findByIdAndUpdate(
            id,
            {...data, updatedAt: new Date()},
            {new: true}
        );
    }

    async delete(id: string): Promise<boolean> {
        const result = await ManualSection.findByIdAndDelete(id);
        return !!result;
    }

    async reorder(featureId: string | Types.ObjectId, sectionIds: string[]): Promise<void> {
        const updates = sectionIds.map((id, index) =>
            ManualSection.findByIdAndUpdate(id, {order: index + 1})
        );
        await Promise.all(updates);
    }
}

export const manualSectionService = new ManualSectionService();