import {IUser} from "@/types/project/User";

export interface Project {
  _id?: string;
  name: string;
  description: string;
  owner: IUser;
  contributors: IUser[];
  githubRepo: string;
  features: string[];
  wiki?: string;
  docs?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

