import mongoose, { mongo } from "mongoose";

mongoose.pluralize(null);

const collection = "users";

const schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    age: { type: Number, index: true },
    gender: { type: String, required: false, index: true },
    role: { type: String, enum: ["ADMIN", "USER", "PREMIUM"], default: "USER" },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
    last_connection: { type: Date },
    documents: [
      {
        _id: false,
        name: { type: String },
        reference: { type: String },
      },
    ],
  },
  {
    versionKey: false,
  }
);

const model = mongoose.model(collection, schema);

export default model;
