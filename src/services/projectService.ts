// projectService.ts
import Project from '@/models/Project';
import { IProject } from '@/models/Project';
import mongoose, { Types } from 'mongoose';
import {UserServiceClass} from "@/services/userService";
import {IUser} from "@/models/User";
import Manual from '@/models/Manual'
import Docs from '@/models/Docs'


export class ProjectService {

 async addDocsReference(projectId: string, docsId: string): Promise<IProject | null> {
  return await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { docs: docsId }, updatedAt: new Date() },
    { new: true }
  );
}

async addManualReference(projectId: string, manualId: string): Promise<IProject | null> {
  return await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { manual: manualId }, updatedAt: new Date() },
    { new: true }
  );
}

async removeDocsReference(projectId: string, docsId: string): Promise<IProject | null> {
  return await Project.findByIdAndUpdate(
    projectId,
    { $pull: { docs: docsId }, updatedAt: new Date() },
    { new: true }
  );
}

async removeManualReference(projectId: string, manualId: string): Promise<IProject | null> {
  return await Project.findByIdAndUpdate(
    projectId,
    { $pull: { manual: manualId }, updatedAt: new Date() },
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
    if (populate?.includes('members')) {
        query = query.populate('members', 'username');
    }
    if (populate?.includes('features')) {
        query = query.populate('features');
    }
    if (populate?.includes('manual')) {
        query = query.populate('manual');
    }

    if (populate?.includes('docs')) {
        query = query.populate<{}>('docs');
    }

    return await query;
}

async getProjectByName(id: string, populate?: string[]): Promise<IProject | null> {
    try {
        if (!id?.trim()) {
            return null;
        }
console.log('Existing models:', mongoose.models);
        let query = Project.findOne({name: id});

        if (populate?.includes('owner')) {
            query = query.populate('owner');
        }
        if (populate?.includes('members')) {
            query = query.populate('members');
        }
        if (populate?.includes('features')) {
            query = query.populate('features');
        }
        if (populate?.includes('manual')) {
            // @ts-ignore
            // query = query.populate<{manual: IManual[]}>('manual');
            Manual();
                        query = query.populate('manual');

        }
        if (populate?.includes('docs')) {
            // @ts-ignore
            // query = query.populate<{docs: IDocs[]}>('docs');
            Docs();
                                    query = query.populate('docs');

        }

        return await query;
    } catch (error) {
        console.error('Error fetching project by name:', error);
        return null;
    }
}

  async getProjectsByOwner(ownerId: string): Promise<IProject[]> {
  return await Project.find({owner: ownerId})
        .populate('members', 'username email');
  }

  async getProjects(): Promise<IProject[]> {
    return await Project.find().populate('members', 'username').populate('owner', 'username');
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

  async addMember(projectId: string, contributorId: string): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: contributorId } },
      { new: true }
    );
  }

  async removeMember(projectId: string, contributorId: string): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: contributorId } },
      { new: true }
    );
  }



  async getMembers(projectId: string): Promise<IUser[]> {
    const project = await Project.findById(projectId).populate<{members: IUser[]}>('members');
    return project?.members || [];
  }
}



const projectService = new ProjectService();
export default projectService;