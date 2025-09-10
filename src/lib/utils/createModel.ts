import {model, Schema} from "mongoose";

export function createModel<T>(name: string, schema: Schema<T>) {
  try {
    return model<T>(name);
  } catch {
    return model<T>(name, schema);
  }
}