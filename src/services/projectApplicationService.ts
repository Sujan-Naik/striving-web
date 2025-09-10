import ProjectApplication, { IProjectApplication } from '@/models/ProjectApplication';
import Project from '@/models/Project';

export class ProjectApplicationService {
  static async createApplication(projectId: string, applicantId: string, message?: string) {
    return await ProjectApplication.create({
      project: projectId,
      applicant: applicantId,
      message,
      status: 'pending'
    });
  }

  static async getApplicationsByProject(projectId: string) {
    return await ProjectApplication.find({ project: projectId })
      .populate('applicant', 'username email avatarUrl')
      .sort({ createdAt: -1 });
  }

  static async getApplicationsByUser(userId: string) {
    return await ProjectApplication.find({ applicant: userId })
      .populate('project', 'name description owner')
      .sort({ createdAt: -1 });
  }

  static async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected') {
    const application = await ProjectApplication.findByIdAndUpdate(
      applicationId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('project applicant');

    // If accepted, add user to project members
    if (status === 'accepted' && application) {
      await Project.findByIdAndUpdate(
        application.project,
        { $addToSet: { members: application.applicant } }
      );
    }

    return application;
  }

  static async hasUserApplied(projectId: string, userId: string) {
    const application = await ProjectApplication.findOne({
      project: projectId,
      applicant: userId
    });
    return !!application;
  }
}