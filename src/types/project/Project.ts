import {IUser} from "@/types/project/User";
import {IFeature} from "@/types/project/Feature";

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: IUser;
  contributors: IUser[];
  githubRepo: string;
  features: IFeature[];
  wiki?: string;
  docs?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

