// wikiSectionService.ts
import WikiSection, { IWikiSection } from '@/models/WikiSection';
import { Types } from 'mongoose';

export class WikiSectionService {
  async create(data: Partial<IWikiSection>): Promise<IWikiSection> {
    const section = new WikiSection(data);
    return await section.save();
  }

  async findById(id: string): Promise<IWikiSection | null> {
    return await WikiSection.findById(id).populate('feature');
  }

  async findByFeature(featureId: string | Types.ObjectId): Promise<IWikiSection[]> {
    return await WikiSection.find({ feature: featureId }).sort({ order: 1 });
  }

  async update(id: string, data: Partial<IWikiSection>): Promise<IWikiSection | null> {
    return await WikiSection.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await WikiSection.findByIdAndDelete(id);
    return !!result;
  }

  async reorder(featureId: string | Types.ObjectId, sectionIds: string[]): Promise<void> {
    const updates = sectionIds.map((id, index) =>
      WikiSection.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);
  }
}

export const wikiSectionService = new WikiSectionService();