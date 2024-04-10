import { expect } from "chai";
import supertest from "supertest";

const request = supertest("http://localhost:8080");

const newProduct = {
  title: "New test product",
  description: "Product description",
  code: 9172,
  price: 99.99,
  stock: 99,
  category: "Product test",
  status: true,
};

let newProductId;

describe("Products Router", () => {
  describe("GET /api/products/all", () => {
    it("Should return a list of products with a status code of 200", async () => {
      const response = await request.get("/api/products/all");
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "OK");
      expect(response.body).to.have.property("data").that.is.an("array");
    });
  });

  describe("POST /api/products", () => {
    it("Should add a new product with a status code of 200", async () => {
      const response = await request.post("/api/products").send(newProduct);
      newProductId = response.body.data._id;
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "OK");
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.have.property("_id");
    });

    it("Should return an error if any parameters are missing when adding a product", async () => {
      const incompleteProduct = {};
      const response = await request
        .post("/api/products")
        .send(incompleteProduct);
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("status", "ERR");
    });
  });

  describe("DELETE /api/products/:pid", () => {
    it("Should delete the newly created product with a status code of 200", async () => {
      const response = await request.delete(`/api/products/${newProductId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "OK");
      expect(response.body)
        .to.have.property("data")
        .that.includes(`Product with ID: ${newProductId} has deleted`);
    });
  });
});
