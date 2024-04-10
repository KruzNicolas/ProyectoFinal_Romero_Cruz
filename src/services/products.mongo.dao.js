import productsModel from "../models/products.models.js";

export class ProductService {
  constructor() {}

  async getAllProdutcs() {
    try {
      return await productsModel.find().lean();
    } catch (err) {
      return err.message;
    }
  }

  async getProduct(id) {
    try {
      const product = await productsModel.findOne({ _id: id }).lean();
      return product === null ? "Product not find" : product;
    } catch (err) {
      return err.message;
    }
  }

  async addProduct(productToCreate) {
    try {
      const product = await productsModel.create(productToCreate);
      return product === null ? `Can't create this product` : product;
    } catch (err) {
      return err.message;
    }
  }

  async updateProduct(id, contentToChange) {
    try {
      return await productsModel.updateOne({ _id: id }, contentToChange);
    } catch (err) {
      return err.message;
    }
  }

  async deleteProduct(id) {
    try {
      return await productsModel.deleteOne({ _id: id });
    } catch (err) {
      return err.message;
    }
  }
}
