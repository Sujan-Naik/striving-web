export interface IUser {
    _id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}