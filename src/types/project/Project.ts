import {IUser} from "@/types/project/User";
import {IFeature} from "@/types/project/Feature";

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: IUser;
  members: IUser[];
  githubRepo: string;
  features: string[];
  manual?: string;
  docs?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

