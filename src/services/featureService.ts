import Feature, { IFeature } from '@/models/Feature';
import { Types } from 'mongoose';
import Project from "@/models/Project";
import {ProjectService} from "@/services/projectService";

class FeatureService {
  async createFeature(featureData: Partial<IFeature>): Promise<IFeature> {
    const feature = new Feature(featureData);
    const savedFeature = await feature.save();

    await Project.findByIdAndUpdate(
        savedFeature.project,
        { $push: { features: savedFeature._id }, updatedAt: new Date() }
    );

    return savedFeature;
  }

  async getFeatureById(id: string): Promise<IFeature | null> {
    return await Feature.findById(id).populate('project assignedUsers');
  }

  async getFeaturesByProject(projectId: string): Promise<IFeature[]> {
    return await Feature.find({ project: projectId }).populate('assignedUsers').populate('documentationSection').populate('wikiSection');
  }

  async updateFeature(id: string, updateData: Partial<IFeature>): Promise<IFeature | null> {
  try {
        console.log('Update data:', updateData); // Add this
    const updatedFeature = await Feature.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )

        console.log('Updated feature:', updatedFeature); // Add this

    if (!updatedFeature) {
      console.log(`Feature with id ${id} not found`);
      return null;
    }

    return updatedFeature;
  } catch (error) {
    console.error('Error updating feature:', error);
    throw error;
  }
}

  async deleteFeature(id: string): Promise<boolean> {
    const result = await Feature.findByIdAndDelete(id);
    return !!result;
  }

  async assignUsers(featureId: string, userIds: string[]): Promise<IFeature | null> {
    return await Feature.findByIdAndUpdate(
      featureId,
      { $addToSet: { assignedUsers: { $each: userIds } } },
      { new: true }
    );
  }

  async updateState(featureId: string, state: string): Promise<IFeature | null> {
    return await Feature.findByIdAndUpdate(
      featureId,
      { state, updatedAt: new Date() },
      { new: true }
    );
  }

  async addCommitSha(featureId: string, commitSha: string): Promise<IFeature | null> {
    return await Feature.findByIdAndUpdate(
      featureId,
      { $addToSet: { commitShas: commitSha } },
      { new: true }
    );
  }

  async addPullRequest(featureId: string, prNumber: number): Promise<IFeature | null> {
    return await Feature.findByIdAndUpdate(
      featureId,
      { $addToSet: { pullRequestNumbers: prNumber } },
      { new: true }
    );
  }

  async removeCommitSha(featureId: string, commitSha: string): Promise<IFeature | null> {
  return await Feature.findByIdAndUpdate(
    featureId,
    { $pull: { commitShas: commitSha } },
    { new: true }
  );
}
}

const featureService = new FeatureService();
export default featureService;