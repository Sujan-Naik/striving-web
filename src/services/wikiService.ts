// wikiService.ts
import Wiki, { IWiki } from '@/models/Wiki';
import '@/models/WikiSection'; // Add this import

export const wikiService = {
  async create(data: {
    project: string;
    content?: string;
    wikiSection: string[];
  }): Promise<IWiki> {
    return await Wiki.create(data);
  },

  async getById(id: string): Promise<IWiki | null> {
    return await Wiki.findById(id).populate('project').populate('wikiSection');
  },

  async getByProject(projectId: string): Promise<IWiki[]> {
    return await Wiki.find({ project: projectId }).populate('wikiSection');
  },

  async update(id: string, data: Partial<Pick<IWiki, 'content' | 'wikiSection'>>): Promise<IWiki | null> {
    return await Wiki.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).populate('project').populate('wikiSection');
  },

  async delete(id: string): Promise<boolean> {
    const result = await Wiki.findByIdAndDelete(id);
    return !!result;
  }
};