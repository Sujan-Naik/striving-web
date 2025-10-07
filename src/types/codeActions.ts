// types/codeActions.ts
export interface CodeAction {
    id: string;
    type: 'create' | 'update' | 'delete';
    path: string;
    content?: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface CodeActionRequest {
    actions: CodeAction[];
    commitMessage: string;
    branch?: string;
}