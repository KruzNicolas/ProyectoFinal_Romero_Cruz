import { Router } from "express";
import { ProductService } from "../services/products.mongo.dao.js";
import productsModel from "../models/products.models.js";
import CustomError from "../services/error.custom.class.js";
import errorDictionary from "../services/error.dictionary.js";
import userModel from "../models/users.models.js";
import { handlePolicies } from "../utils.js";

const router = Router();
const controller = new ProductService();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const sort = req.query.sort;

    const categoryContent = req.query.category;
    const statusContent = req.query.status;

    let statusContentBoolean;

    if (statusContent === "true") {
      statusContentBoolean = true;
    } else {
      statusContentBoolean = false;
    }

    let products;
    let queryConditions = {};

    if (categoryContent) {
      queryConditions.category = categoryContent;
    }

    if (statusContent != undefined) {
      queryConditions.status = statusContentBoolean;
    }

    if (sort) {
      products = await productsModel.paginate(queryConditions, {
        offset: (page - 1) * limit,
        limit: limit,
        sort: { price: sort },
        lean: true,
      });
    } else {
      products = await productsModel.paginate(queryConditions, {
        offset: (page - 1) * limit,
        limit: limit,
        lean: true,
      });
    }

    res.status(200).send({ status: "OK", data: products });
  } catch (error) {
    res.status(500).send({ status: "ERR", data: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const products = await controller.getAllProdutcs();
    req.logger.http("GET /api/products/all");
    res.status(200).send({ status: "OK", data: products });
  } catch (error) {
    req.logger.error("GET /api/products/all");
    res.status(400).send({ status: "ERR", data: error.message });
  }
});

router.get("/:pid", async (req, res, next) => {
  const pId = req.params.pid;
  const product = await controller.getProduct(pId);
  if (!product) {
    req.logger.error(`GET /api/products/${pId}`);
    return next(new CustomError(errorDictionary.ID_NOT_FOUND));
  }
  req.logger.http(`GET /api/products/${pId}`);
  res.status(200).send({ status: "OK", data: product });
});

router.post("/", async (req, res, next) => {
  if (
    !req.body.title ||
    !req.body.description ||
    !req.body.code ||
    !req.body.price ||
    !req.body.stock ||
    !req.body.category ||
    !req.body.status
  ) {
    req.logger.error(`POST /api/products/`);
    return next(new CustomError(errorDictionary.FEW_PARAMETERS));
  }
  const newProduct = req.body;
  const productAdded = await controller.addProduct(newProduct);
  req.logger.http(`POST /api/products`);
  res.status(200).send({
    status: "OK",
    data: productAdded,
  });
});

router.put("/:pid", async (req, res, next) => {
  const pId = req.params.pid;
  if (req.body.status === undefined) {
    req.logger.error(`PUT /api/products/${pId}`);
    return next(new CustomError(errorDictionary.FEW_PARAMETERS));
  }

  const productUpdate = req.body;

  await controller.updateProduct(pId, productUpdate);
  req.logger.http(`PUT /api/products/${pId}`);
  res
    .status(200)
    .send({ status: "OK", data: `product with ID: ${pId} has updated` });
});

router.delete("/:pid", async (req, res) => {
  try {
    const pId = req.params.pid;

    await controller.deleteProduct(pId);
    req.logger.http(`DELETE /api/products/${pId}`);
    res
      .status(200)
      .send({ status: "OK", data: `Product with ID: ${pId} has deleted` });
  } catch (err) {
    req.logger.error(`DELETE /api/products/${pId}`);
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

// Routes with policies

router.post(
  "/policies",
  handlePolicies(["ADMIN", "PREMIUM"]),
  async (req, res, next) => {
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.code ||
      !req.body.price ||
      !req.body.stock ||
      !req.body.category ||
      !req.body.status
    ) {
      req.logger.error(`POST /api/products/`);
      return next(new CustomError(errorDictionary.FEW_PARAMETERS));
    }
    const newProduct = req.body;
    const productAdded = await controller.addProduct(newProduct);
    req.logger.http(`POST /api/products`);
    res.status(200).send({
      status: "OK",
      data: `Product added with ID: ${productAdded._id}`,
    });
  }
);

router.delete(
  "/policies/:pid",
  handlePolicies(["ADMIN", "PREMIUM"]),
  async (req, res) => {
    try {
      if (req.session.user.role === "ADMIN") {
        const pId = req.params.pid;
        await controller.deleteProduct(pId);
        req.logger.http(`DELETE /api/products/${pId}`);
        res
          .status(200)
          .send({ status: "OK", data: `Product with ID: ${pId} has deleted` });
      } else if (req.session.user.role === "PREMIUM") {
        const pId = req.params.pid;
        const userName = req.session.user.username;
        const user = userModel.findOne({ username: userName });
        if (!user) {
          await controller.deleteProduct(pId);
          req.logger.http(`DELETE /api/products/${pId}`);
          res.status(200).send({
            status: "OK",
            data: `Product with ID: ${pId} has deleted`,
          });
        } else {
          res.status(403).send({
            status: "ERROR",
            data: "You cannot delete products created by another user",
          });
        }
      }
    } catch (err) {
      req.logger.error(`DELETE /api/products/${pId}`);
      res.status(400).send({ status: "ERR", data: err.message });
    }
  }
);

export default router;
