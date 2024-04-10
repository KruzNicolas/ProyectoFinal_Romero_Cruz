import mongoose, { mongo } from "mongoose";

mongoose.pluralize(null);

const collection = "carts";

const schema = new mongoose.Schema(
  {
    products: [
      {
        _id: false,
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
        quantity: { type: Number, default: 1 },
      },
    ],
    status: { type: String, default: "ONGOING" },
  },
  {
    versionKey: false,
  }
);

const model = mongoose.model(collection, schema);

export default model;
