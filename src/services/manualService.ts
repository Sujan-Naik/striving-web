// manualService.ts
import Manual, { IManual } from '@/models/Manual';
import '@/models/ManualSection';
import {Types} from "mongoose";
import projectService from "@/services/projectService"; // Add this import

export const manualService = {
  async create(data: {
  project: string;
  content?: string;
  manualSection: string[];
}): Promise<IManual> {
  const manual = await Manual.create(data);

  // Update project with manual reference
  await projectService.addManualReference(data.project, (manual._id as Types.ObjectId).toString());

  return manual;
},

  async getById(id: string): Promise<IManual | null> {
    return await Manual.findById(id).populate('project').populate('manualSections').populate('manualSections.manualSection').populate('manualSections.parentSection');
  },

  async getByProject(projectId: string): Promise<IManual[]> {

    // Populate all referenced fields
  const manual = await Manual.find({ project: projectId }).populate([
    'project',
    'manualSections.manualSection',
    'manualSections',
    'manualSections.parentSection'
  ]);

  return manual;

  //
  // return await Manual.find({ project: projectId })
  //   .populate('manualSections.manualSection')
    // .populate('manualSections.parentSection');
},

  async update(id: string | Types.ObjectId, data: Partial<Pick<IManual, 'content' | 'manualSections'>>): Promise<IManual | null> {
    return await Manual.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  },


  async delete(id: string): Promise<boolean> {
    const result = await Manual.findByIdAndDelete(id);
    return !!result;
  },


};