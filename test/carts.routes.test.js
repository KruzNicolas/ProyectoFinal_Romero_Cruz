import { expect } from "chai";
import supertest from "supertest";

const request = supertest("http://localhost:8080");

describe("Carts Router", () => {
  let cartId;

  it("Should create a new cart with a status code of 200", async () => {
    const response = await request.post("/api/carts");
    cartId = response.body.data._id;
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("status", "OK");
    expect(response.body).to.have.property("data");
    expect(response.body.data).to.have.property("_id");
  });

  it("Should add a product to the cart with a status code of 200", async () => {
    const productId = "6572daf5a24f67e6dbd240d9";
    const response = await request.post(
      `/api/carts/${cartId}/products/${productId}`
    );
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("status", "OK");
    expect(response.body)
      .to.have.property("data")
      .that.includes(
        `Product with ID: ${productId} added in Cart with ID: ${cartId}`
      );
  });

  it("Should empty the cart with a status code of 200", async () => {
    const response = await request.delete(`/api/carts/${cartId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("status", "OK");
    expect(response.body).to.have.property("data", "Cart products are deleted");
  });
});
