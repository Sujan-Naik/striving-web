import Feature, { IFeature } from '@/models/Feature';
import { Types } from 'mongoose';

export class FeatureService {
  async createFeature(featureData: Partial<IFeature>): Promise<IFeature> {
    const feature = new Feature(featureData);
    return await feature.save();
  }

  async getFeatureById(id: string): Promise<IFeature | null> {
    return await Feature.findById(id).populate('project assignedUsers');
  }

  async getFeaturesByProject(projectId: string): Promise<IFeature[]> {
    return await Feature.find({ project: projectId }).populate('assignedUsers');
  }

  async updateFeature(id: string, updateData: Partial<IFeature>): Promise<IFeature | null> {
    return await Feature.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('project assignedUsers');
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
}