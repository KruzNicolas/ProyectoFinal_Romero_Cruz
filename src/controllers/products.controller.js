
import { ProductService } from "../services/products.mongo.dao.js";

const productService = new ProductService()

export class ProductController {
    constructor () {

    }

    async getAllProducts () {
        try{
            return await productService.getAllProdutcs()
        } catch (err) {
            return err.message 
        }
        
    }

    async getProduct (id) {
        try{
            return await productService.getProduct(id)
        } catch (err){
            return err.message
        }
    }

    async addProduct (productToCreate) {
        try{
            return await productService.addProduct(productToCreate)
        } catch (err) {
            return err.message
        }
    }

    async updateProduct (id, contentToChange) {
        try {
            return await productService.updateProduct(id, contentToChange)
        } catch (err) {
            return err.message
        }
    }

    async deleteProduct (id) {
        try {
            return await productService.deleteProduct(id)
        } catch (err) {
            return err.message
        }
    }
}