// wikiService.ts
import Wiki, { IWiki } from '@/models/Wiki';
import '@/models/WikiSection';
import {Types} from "mongoose";
import projectService from "@/services/projectService"; // Add this import

export const wikiService = {
  async create(data: {
  project: string;
  content?: string;
  wikiSection: string[];
}): Promise<IWiki> {
  const wiki = await Wiki.create(data);

  // Update project with wiki reference
  await projectService.addWikiReference(data.project, (wiki._id as Types.ObjectId).toString());

  return wiki;
},

  async getById(id: string): Promise<IWiki | null> {
    return await Wiki.findById(id).populate('project').populate('wikiSections');
  },

  async getByProject(projectId: string): Promise<IWiki[]> {
    return await Wiki.find({ project: projectId })
            .populate('wikiSections.wikiSection')
;
  },

  async update(id: string | Types.ObjectId, data: Partial<Pick<IWiki, 'content' | 'wikiSections'>>): Promise<IWiki | null> {
    return await Wiki.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  },


  async delete(id: string): Promise<boolean> {
    const result = await Wiki.findByIdAndDelete(id);
    return !!result;
  },


};