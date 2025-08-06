import {model, Schema, Document, models, Model} from "mongoose";
import {createModel} from "@/lib/utils/createModel";

export interface IUser extends Document {
  githubId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export default createModel<IUser>('User', UserSchema);
