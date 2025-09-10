import {IUser} from "@/types/project/User";
import {IFeature} from "@/types/project/Feature";
import {IManual} from "@/types/project/Manual";
import {IDocs} from "@/types/project/Docs";

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: IUser;
  members: IUser[];
  githubRepo: string;
  features: string[];
  manual: IManual[];
  docs: IDocs[];
  createdAt?: Date;
  updatedAt?: Date;
}

