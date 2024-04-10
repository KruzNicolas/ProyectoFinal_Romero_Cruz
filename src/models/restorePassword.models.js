import mongoose, { mongo } from "mongoose";

mongoose.pluralize(null);

const collection = "restorePassword";

const schema = new mongoose.Schema(
  {
    mail: { type: String, required: true },
    token: { type: String, required: true },
    expirationDate: { type: Date, required: true },
  },
  {
    versionKey: false,
  }
);

const model = mongoose.model(collection, schema);

export default model;
