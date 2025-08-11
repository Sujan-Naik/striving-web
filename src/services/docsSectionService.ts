// docsSectionService.ts
import DocsSection, { IDocsSection } from '@/models/DocsSection';
import { Types } from 'mongoose';

export class DocsSectionService {
  async create(data: Partial<IDocsSection>): Promise<IDocsSection> {
    const section = new DocsSection(data);
    return await section.save();
  }

  async findById(id: string): Promise<IDocsSection | null> {
    return await DocsSection.findById(id).populate('feature');
  }

  async findByFeature(featureId: string | Types.ObjectId): Promise<IDocsSection[]> {
    return await DocsSection.find({ feature: featureId }).sort({ order: 1 });
  }

  async update(id: string, data: Partial<IDocsSection>): Promise<IDocsSection | null> {
    return await DocsSection.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await DocsSection.findByIdAndDelete(id);
    return !!result;
  }

  async reorder(featureId: string | Types.ObjectId, sectionIds: string[]): Promise<void> {
    const updates = sectionIds.map((id, index) =>
      DocsSection.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);
  }
}

export const docsSectionService = new DocsSectionService();