// projectService.ts
import Project from '@/models/Project';
import { IProject } from '@/models/Project';
import mongoose, { Types } from 'mongoose';

export class ProjectService {
  async createProject(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return await project.save();
  }

  async getProjectById(id: string): Promise<IProject | null> {
    return Project.findById(id)
        .populate('owner', 'username email')
        .populate('contributors', 'username email')
        .populate('features')
        .populate('wiki');
  }

  async getProjectsByOwner(ownerId: string): Promise<IProject[]> {
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

  return await Project.find({owner: ownerId})
        .populate('contributors', 'username email');
  }

  async updateProject(id: string, updates: Partial<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(
        id,
        {...updates, updatedAt: new Date()},
        {new: true}
    );
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await Project.findByIdAndDelete(id);
    return !!result;
  }

  async addContributor(projectId: string, contributorId: string): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { contributors: contributorId } },
      { new: true }
    );
  }

  async removeContributor(projectId: string, contributorId: string): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      { $pull: { contributors: contributorId } },
      { new: true }
    );
  }
}