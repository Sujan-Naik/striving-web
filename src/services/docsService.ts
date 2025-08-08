import { Types } from 'mongoose';
import Docs from '@/models/Docs';
import { IDocs } from '@/models/Docs';

class DocsService {
  async createDoc(projectId: string, content?: string, documentationSections?: string[]): Promise<IDocs> {
    const doc = new Docs({
      project: new Types.ObjectId(projectId),
      content: content || '',
      documentationSection: documentationSections?.map(id => new Types.ObjectId(id)) || []
    });
    return await doc.save();
  }

  async getDocById(id: string): Promise<IDocs | null> {
    return await Docs.findById(id).populate('project').populate('documentationSection');
  }

  async getDocsByProject(projectId: string): Promise<IDocs[]> {
    return await Docs.find({ project: projectId }).populate('project').populate('documentationSection');
  }

  async updateDoc(id: string, updates: Partial<Pick<IDocs, 'content' | 'documentationSection'>>): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteDoc(id: string): Promise<IDocs | null> {
    return await Docs.findByIdAndDelete(id);
  }

  async addDocumentationSection(docId: string, sectionId: string): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      docId,
      {
        $push: { documentationSection: new Types.ObjectId(sectionId) },
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async removeDocumentationSection(docId: string, sectionId: string): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      docId,
      {
        $pull: { documentationSection: new Types.ObjectId(sectionId) },
        updatedAt: new Date()
      },
      { new: true }
    );
  }
}

export default new DocsService();