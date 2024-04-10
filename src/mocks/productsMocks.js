import { Router } from "express";
import { faker } from "@faker-js/faker";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const mockProducts = [];
    const quantity = parseInt(req.query.qty) || 100;

    for (let i = 0; i < quantity; i++) {
      const product = {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.number.int(9999) + 1,
        price: faker.commerce.price({ min: 5, max: 320, symbol: "$" }),
        status: faker.datatype.boolean(),
        stock: faker.number.int(100) + 1,
        category: faker.commerce.department(),
        thumbnail: faker.image.url(),
      };
      mockProducts.push(product);
    }

    res.status(200).send({ status: "OK", data: mockProducts });
  } catch (err) {
    res.status(500).send({ status: "ERROR", data: err.message });
  }
});

export default router;
