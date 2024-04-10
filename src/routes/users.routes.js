import { Router } from "express";
import userModel from "../models/users.models.js";
import CustomError from "../services/error.custom.class.js";
import errorDictionary from "../services/error.dictionary.js";
import upload from "../uploader.js";
import config from "../config.js";

const router = Router();

router.get("/:uname/", async (req, res) => {
  try {
    const userName = req.params.uname;

    const user = await userModel.findOne({ username: userName }).lean();

    res.status(200).send({
      status: "OK",
      data: {
        username: user.username,
        role: user.role,
        cartId: user.cartId,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).send({ status: "ERROR", data: error.message });
  }
});

router.post("/:uname/cart/:cid", async (req, res) => {
  try {
    const userName = req.params.uname;
    const cartId = req.params.cid;

    await userModel.updateOne({ username: userName }, { cartId: cartId });
    res.status(200).send({ status: "OK", data: "user updated" });
  } catch (error) {
    res.status(400).send({ status: "ERROR", data: error.message });
  }
});

router.post("/premium/:uid", async (req, res, next) => {
  const userId = req.params.uid;

  if (!req.params.uid) {
    req.logger.error(`GET /api/users/${userId}`);
    return next(new CustomError(errorDictionary.ID_NOT_FOUND));
  }

  const user = await userModel.findOne({ _id: userId }).lean();

  const hasRequiredDocuments =
    user.documents &&
    user.documents.some((doc) => {
      return ["DNI", "Address", "Account state"].includes(doc.name);
    });

  if (!hasRequiredDocuments) {
    req.logger.error(`GET /api/users/${userId}`);
    res.status(400).send({
      status: "ERROR",
      data: `User: ${user.username} does not have all the required documents`,
    });
  }

  if (user.role === "USER" && hasRequiredDocuments) {
    await userModel.updateOne({ _id: userId }, { role: "PREMIUM" });
    res.status(200).send({
      status: "OK",
      data: `User: ${user.username} role update to Premium`,
    });
  } else if (user.role === "PREMIUM") {
    await userModel.updateOne({ _id: userId }, { role: "USER" });
    res.status(200).send({
      status: "OK",
      data: `User: ${user.username} role update to User`,
    });
  }
});

router.post(
  "/:uid/documents/dni",
  upload.single("dni"),
  async (req, res, next) => {
    const userId = req.params.uid;
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      req.logger.error(`POST /api/users/${uId}/documents`);
      return next(new CustomError(errorDictionary.ID_NOT_FOUND));
    }
    if (!req.file) {
      req.logger.error(`POST /api/users/${uId}/documents`);
      return next(new CustomError(errorDictionary.FEW_PARAMETERS));
    }

    const filePath = `${config.__DIRNAME}/public/documents/${req.file.filename}`;

    await userModel.updateOne(
      { _id: userId },
      {
        $push: {
          documents: {
            name: `DNI`,
            reference: filePath,
          },
        },
      }
    );

    res.status(200).send({ status: "OK", data: "File uploaded" });
  }
);

router.post(
  "/:uid/documents/address",
  upload.single("address"),
  async (req, res, next) => {
    const userId = req.params.uid;
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      req.logger.error(`POST /api/users/${uId}/documents`);
      return next(new CustomError(errorDictionary.ID_NOT_FOUND));
    }
    if (!req.file) {
      req.logger.error(`POST /api/users/${uId}/documents`);
      return next(new CustomError(errorDictionary.FEW_PARAMETERS));
    }

    const filePath = `${config.__DIRNAME}/public/documents/${req.file.filename}`;

    await userModel.updateOne(
      { _id: userId },
      {
        $push: {
          documents: {
            name: `Address`,
            reference: filePath,
          },
        },
      }
    );

    res.status(200).send({ status: "OK", data: "File uploaded" });
  }
);

router.post(
  "/:uid/documents/accountstate",
  upload.single("accountstate"),
  async (req, res, next) => {
    const userId = req.params.uid;
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      req.logger.error(`POST /api/users/${uId}/documents`);
      return next(new CustomError(errorDictionary.ID_NOT_FOUND));
    }
    if (!req.file) {
      req.logger.error(`POST /api/users/${uId}/documents`);
      return next(new CustomError(errorDictionary.FEW_PARAMETERS));
    }

    const filePath = `${config.__DIRNAME}/public/documents/${req.file.filename}`;

    await userModel.updateOne(
      { _id: userId },
      {
        $push: {
          documents: {
            name: `Account state`,
            reference: filePath,
          },
        },
      }
    );

    res.status(200).send({ status: "OK", data: "File uploaded" });
  }
);

export default router;
