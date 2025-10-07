// docsService.ts
import Docs, {IDocs} from '@/models/Docs';
import '@/models/DocsSection';
import {Types} from "mongoose";
import projectService from "@/services/projectService"; // Add this import

export const docsService = {
    async create(data: {
        project: string;
        content?: string;
        docsSection: string[];
    }): Promise<IDocs> {
        const docs = await Docs.create(data);

        // Update project with docs reference
        await projectService.addDocsReference(data.project, (docs._id as Types.ObjectId).toString());

        return docs;
    },

    async getById(id: string): Promise<IDocs | null> {
        return await Docs.findById(id).populate('project').populate('docsSections').populate('docsSections.docsSection').populate('docsSections.parentSection');
    },

    async getByProject(projectId: string): Promise<IDocs[]> {

        // Populate all referenced fields
        const docs = await Docs.find({project: projectId}).populate([
            'project',
            'docsSections.docsSection',
            'docsSections',
            'docsSections.parentSection'
        ]);

        return docs;

        //
        // return await Docs.find({ project: projectId })
        //   .populate('docsSections.docsSection')
        // .populate('docsSections.parentSection');
    },

    async update(id: string | Types.ObjectId, data: Partial<Pick<IDocs, 'content' | 'docsSections'>>): Promise<IDocs | null> {
        return await Docs.findByIdAndUpdate(
            id,
            {...data, updatedAt: new Date()},
            {new: true}
        );
    },


    async delete(id: string): Promise<boolean> {
        const result = await Docs.findByIdAndDelete(id);
        return !!result;
    },


};