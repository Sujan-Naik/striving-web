// documentationSectionService.ts
import DocumentationSection, { IDocumentationSection } from '@/models/DocumentationSection';
import { Types } from 'mongoose';

export class DocumentationSectionService {
  async create(data: Partial<IDocumentationSection>): Promise<IDocumentationSection> {
    const section = new DocumentationSection(data);
    return await section.save();
  }

  async findById(id: string): Promise<IDocumentationSection | null> {
    return await DocumentationSection.findById(id).populate('feature');
  }

  async findByFeature(featureId: string | Types.ObjectId): Promise<IDocumentationSection[]> {
    return await DocumentationSection.find({ feature: featureId }).sort({ order: 1 });
  }

  async update(id: string, data: Partial<IDocumentationSection>): Promise<IDocumentationSection | null> {
    return await DocumentationSection.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await DocumentationSection.findByIdAndDelete(id);
    return !!result;
  }

  async reorder(featureId: string | Types.ObjectId, sectionIds: string[]): Promise<void> {
    const updates = sectionIds.map((id, index) =>
      DocumentationSection.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);
  }
}

export const documentationSectionService = new DocumentationSectionService();