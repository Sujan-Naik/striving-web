// wikiService.ts
import Wiki, { IWiki } from '@/models/Wiki';
import { Types } from 'mongoose';

export const wikiService = {
  async create(data: Partial<IWiki>): Promise<IWiki> {
    return await Wiki.create(data);
  },

  async findById(id: string): Promise<IWiki | null> {
    return await Wiki.findById(id).populate('project features docs');
  },

  async findByProject(projectId: string): Promise<IWiki[]> {
    return await Wiki.find({ project: projectId }).populate('features docs');
  },

  async update(id: string, data: Partial<IWiki>): Promise<IWiki | null> {
    return await Wiki.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  },

  async delete(id: string): Promise<IWiki | null> {
    return await Wiki.findByIdAndDelete(id);
  },

  async findAll(): Promise<IWiki[]> {
    return await Wiki.find().populate('project features docs');
  }
};