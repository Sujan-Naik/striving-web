import { Types } from 'mongoose';
import Docs from '@/models/Docs';
import { IDocs } from '@/models/Docs';

class DocsService {
  async createDoc(wikiId: string, content?: string, sections?: Array<{title: string, content: string, order: number}>): Promise<IDocs> {
    const doc = new Docs({
      wiki: new Types.ObjectId(wikiId),
      content: content || '',
      sections: sections || []
    });
    return await doc.save();
  }

  async getDocById(id: string): Promise<IDocs | null> {
    return await Docs.findById(id).populate('wiki');
  }

  async getDocsByWiki(wikiId: string): Promise<IDocs[]> {
    return await Docs.find({ wiki: wikiId }).populate('wiki');
  }

  async updateDoc(id: string, updates: Partial<Pick<IDocs, 'content' | 'sections'>>): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteDoc(id: string): Promise<IDocs | null> {
    return await Docs.findByIdAndDelete(id);
  }

  async addSection(docId: string, section: {title: string, content: string, order: number}): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      docId,
      {
        $push: { sections: section },
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async updateSection(docId: string, sectionId: string, updates: Partial<{title: string, content: string, order: number}>): Promise<IDocs | null> {
    return await Docs.findOneAndUpdate(
      { _id: docId, 'sections._id': sectionId },
      {
        $set: Object.keys(updates).reduce((acc, key) => {
          acc[`sections.$.${key}`] = updates[key as keyof typeof updates];
          return acc;
        }, {} as any),
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async removeSection(docId: string, sectionId: string): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      docId,
      {
        $pull: { sections: { _id: sectionId } },
        updatedAt: new Date()
      },
      { new: true }
    );
  }
}

export default new DocsService();