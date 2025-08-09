// projectService.ts
import Project from '@/models/Project';
import { IProject } from '@/models/Project';
import mongoose, { Types } from 'mongoose';
import {UserServiceClass} from "@/services/userService";

export class ProjectService {

  async addDocsReference(projectId: string, docsId: string): Promise<IProject | null> {
  return await Project.findByIdAndUpdate(
    projectId,
    { docs: docsId, updatedAt: new Date() },
    { new: true }
  );
}

async addWikiReference(projectId: string, wikiId: string): Promise<IProject | null> {
  return await Project.findByIdAndUpdate(
    projectId,
    { wiki: wikiId, updatedAt: new Date() },
    { new: true }
  );
}

  async createProject(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return await project.save();
  }

  async getProjectById(id: string, populate?: string[]): Promise<IProject | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    let query = Project.findById(id);

    if (populate?.includes('owner')) {
        query = query.populate('owner', 'username');
    }
    if (populate?.includes('contributors')) {
        query = query.populate('contributors', 'username');
    }
    if (populate?.includes('features')) {
        query = query.populate('features');
    }
    if (populate?.includes('wiki')) {
        query = query.populate('wiki');
    }

    return await query;
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

const projectService = new ProjectService();
export default projectService;