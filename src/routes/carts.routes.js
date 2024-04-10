import { Router } from "express";
import mongoose, { mongo } from "mongoose";
import { format } from "date-fns";
import cartsModel from "../models/carts.models.js";
import ticketModel from "../models/ticket.models.js";
import productsModel from "../models/products.models.js";
import userModel from "../models/users.models.js";
import Stripe from "stripe";

import { handlePolicies } from "../utils.js";

const router = Router();

const stripe = new Stripe(
  "sk_test_51P2ZO82LrnKsdsRXPLkZN7gHoWcyMU025uNa9k0LP1E3b3Ej6C4W6Mf3joTx7Wayu4Y6KUspkHrOYAIrLnPMhkMH00j17xqiui"
);

class Carts {
  static carts = [];

  constructor() {
    this.products = [];
  }
}

router.post("/", async (req, res) => {
  try {
    const newCart = new Carts();
    const newCardDb = await cartsModel.create(newCart);

    res.status(200).send({ status: "OK", data: newCardDb._id });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await cartsModel
      .findOne({ _id: cId })
      .populate({ path: "products", model: productsModel })
      .lean();
    res.status(200).send({ status: "OK", data: { cart } });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const productIdObj = new mongoose.Types.ObjectId(productId);
    const cart = await cartsModel.findOne({ _id: cartId });

    if (
      cart.products.some((product) => product.productId.equals(productIdObj))
    ) {
      await cartsModel.updateOne(
        { _id: cartId, "products.productId": productIdObj },
        { $inc: { "products.$.quantity": 1 } }
      );
    } else {
      await cartsModel.updateOne(
        { _id: cartId },
        { $push: { products: { productId: productIdObj, quantity: 1 } } }
      );
    }

    res.status(200).send({
      status: "OK",
      data: `Product with ID: ${productId} added in Cart with ID: ${cartId}`,
    });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    await cartsModel.updateOne(
      { _id: cartId },
      { $pull: { products: { productId: productId } } }
    );

    res.status(200).send({
      status: "OK",
      data: `Product with ID: ${productId} removed from Cart with ID: ${cartId}`,
    });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.post("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const newProducts = req.body.products;

    await cartsModel.updateOne(
      { _id: cartId },
      { $set: { products: newProducts } }
    );
    res.status(200).send({ status: "OK", data: "Cart updated" });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    const productIdObj = mongoose.Types.ObjectId(productId);

    await cartsModel.updateOne(
      { _id: cartId, "products.productId": productIdObj },
      { $inc: { "products.$.quantity": quantity } }
    );

    res.status(200).send({
      status: "OK",
      data: `Update the quantity in: ${quantity} of a product with ID: ${productId} in cart with ID: ${cartId}`,
    });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    await cartsModel.updateOne({ _id: cartId }, { $set: { products: [] } });

    res.status(200).send({ status: "OK", data: "Cart products are deleted" });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

router.post("/:cid/purchase", async (req, res) => {
  try {
    const lineItems = [];

    const cartId = req.params.cid;
    const email = req.body.email;
    const cart = await cartsModel.findOne({ _id: cartId });
    const PriceByProductArray = [];

    for (const product of cart.products) {
      const productInProducts = await productsModel
        .findOne({ _id: product.productId })
        .lean();

      if (product.quantity <= productInProducts.stock) {
        const stockToChange = productInProducts.stock - product.quantity;
        const updateProduct = await productsModel.findOneAndUpdate(
          { _id: product.productId },
          { stock: stockToChange }
        );
        PriceByProductArray.push(updateProduct.price * product.quantity);

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: productInProducts.title,
            },
            unit_amount: Math.floor(productInProducts.price * 100), // Convertir a centavos
          },
          quantity: product.quantity,
        });
      } else {
        await cartsModel.updateOne(
          { _id: cartId },
          { $pull: { products: { productId: product.productId } } }
        );
      }
    }

    const dateNow = new Date();
    const formatedDateNow = format(dateNow, "yyyy-MM-dd HH:mm:ss");

    await ticketModel.create({
      purchaseDatetime: formatedDateNow,
      amout: PriceByProductArray.reduce((a, b) => a + b, 0),
      purchaser: email,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:8080/buysucced",
      cancel_url: "http://localhost:8080/buycancel",
    });

    await cartsModel.updateOne({ _id: cartId }, { status: "COMPLETED" });
    await userModel.findOneAndUpdate(
      { email: email },
      { $unset: { cartId: cartId } }
    );
    res.status(200).send({
      status: "OK",
      data: { message: "Purchase completed", url: session.url },
    });
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

// Routes with polices

router.post("/policies/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const username = req.session.user.username;

    const product = productsModel.findOne({ _id: productId });

    const user = userModel.findOne({ username: username });

    if (product.owner === user.username)
      return res
        .status(400)
        .send({ status: "ERR", data: "You cannot add a own product" });

    const productIdObj = mongoose.Types.ObjectId(productId);
    const cart = await cartsModel.findOne({ _id: cartId });

    if (
      cart.products.some((product) => product.productId.equals(productIdObj))
    ) {
      await cartsModel.updateOne(
        { _id: cartId, "products.productId": productIdObj },
        { $inc: { "products.$.quantity": 1 } }
      );
    } else {
      await cartsModel.updateOne(
        { _id: cartId },
        { $push: { products: { productId: productIdObj, quantity: 1 } } }
      );
    }

    res.status(200).send(`Se agrego el producto con id: ${productIdObj}`);
  } catch (err) {
    res.status(400).send({ status: "ERR", data: err.message });
  }
});

export default router;
