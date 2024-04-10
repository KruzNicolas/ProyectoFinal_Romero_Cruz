import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

mongoose.pluralize(null);

const collection = "tickets";

const schema = new mongoose.Schema(
  {
    code: { type: String, default: uuidv4 },
    purchaseDatetime: { type: String, required: true },
    amout: { type: Number, required: true },
    purchaser: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const model = mongoose.model(collection, schema);

export default model;
