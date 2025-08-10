// docsService.ts
import Docs, { IDocs } from '@/models/Docs';
import '@/models/DocumentationSection';
import {Types} from "mongoose";
import projectService from "@/services/projectService"; // Add this import

export const docsService = {
  async create(data: {
  project: string;
  content?: string;
  documentationSection: string[];
}): Promise<IDocs> {
  const docs = await Docs.create(data);

  // Update project with docs reference
  await projectService.addDocsReference(data.project, (docs._id as Types.ObjectId).toString());

  return docs;
},

  async getById(id: string): Promise<IDocs | null> {
    return await Docs.findById(id).populate('project').populate('documentationSections');
  },

  async getByProject(projectId: string): Promise<IDocs[]> {
  return await Docs.find({ project: projectId })
    .populate('documentationSections.documentationSection')
    // .populate('documentationSections.parentSection');
},

  async update(id: string | Types.ObjectId, data: Partial<Pick<IDocs, 'content' | 'documentationSections'>>): Promise<IDocs | null> {
    return await Docs.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  },


  async delete(id: string): Promise<boolean> {
    const result = await Docs.findByIdAndDelete(id);
    return !!result;
  },


};