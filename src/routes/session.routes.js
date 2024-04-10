import { Router } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import nodemailer from "nodemailer";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

import userModel from "../models/users.models.js";
import restorePasswordModel from "../models/restorePassword.models.js";
import { createHash, isValidPassword, handlePolicies } from "../utils.js";
import initPassport from "../config/passport.config.js";
import config from "../config.js";

initPassport();

const router = Router();

const mailerService = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: config.GMAIL_APP_EMAIL,
    pass: config.GMAIL_APP_PASSWORD,
  },
});

// Register
router.post("/register", async (req, res) => {
  const user = req.body;

  const userInDb = await userModel.findOne({
    $or: [{ username: user.username }, { email: user.email }],
  });

  if (userInDb) {
    if (userInDb.email === user.email)
      return res
        .status(400)
        .send({ status: "ERROR", data: `Mail already register` });
  }

  user.password = createHash(user.password);

  await userModel.create(user);

  res.status(200).send({ status: "OK", data: `User registered` });
});

// Restore password

router.post("/restorepasswordmail", async (req, res) => {
  try {
    const { mail } = req.body;

    const user = await userModel.findOne({ email: mail }).lean();

    if (!user)
      return res.status(400).send({ status: "ERROR", data: "Not valid mail" });

    const token = uuidv4();
    const expirationDate = moment().add(1, "h").toDate();
    const restorePasswordLink = `http://localhost:8080/restorepassword?t=${token}`;

    const subject = "Videogame store password restore confirmation";
    const html = `<h1>Videogame store password restore confirmation</h1>
    <a href="${restorePasswordLink}" target="_blank">Restore password</a>
    <p> This link is valid for 1 hour </p>`;

    await mailerService.sendMail({
      from: config.GMAIL_APP_EMAIL,
      to: mail,
      subject: subject,
      html: html,
    });

    await restorePasswordModel.create({
      mail: mail,
      token: token,
      expirationDate: expirationDate,
    });

    res.status(200).send({ status: "OK", data: `Password changed` });
  } catch (err) {
    res.status(400).send({ status: "ERROR", data: err.message });
  }
});

router.post("/restorepassword", async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    const tokenIdDb = await restorePasswordModel
      .findOne({ token: token })
      .lean();

    if (!tokenIdDb) {
      return res.status(400).send({ status: "ERROR", data: "Invalid token" });
    } else if (moment().isAfter(tokenIdDb.expirationDate)) {
      await restorePasswordModel.deleteOne({ token: token });
      return res
        .status(400)
        .send({ status: "ERROR", data: "Token has expired" });
    }

    const hashedPassword = createHash(newPassword);
    const user = await userModel.findOne({ email: tokenIdDb.mail }).lean();

    if (bcrypt.compareSync(newPassword, user.password))
      return res
        .status(400)
        .send({ status: "ERROR", data: "Don't use the same password" });

    await userModel.updateOne(
      { email: tokenIdDb.mail },
      { password: hashedPassword }
    );
    await restorePasswordModel.deleteOne({ token: token });

    res.status(200).send({ status: "OK", data: `Password changed` });
  } catch (err) {
    res.status(400).send({ status: "ERROR", data: err.message });
  }
});

router.get("/failrestore", async (req, res) => {
  res.status(400).send({ status: "ERROR", data: "Username are not correct" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const searchUserBaseData = await userModel
    .findOne({ username: username })
    .lean();

  if (!searchUserBaseData)
    return res
      .status(401)
      .send({ status: "ERROR", data: "Username or Password are incorrect" });

  if (
    username === searchUserBaseData.username &&
    isValidPassword(searchUserBaseData, password)
  ) {
    if (username === "Sombra") {
      req.session.user = {
        username: username,
        firstName: searchUserBaseData.firstName,
        lastName: searchUserBaseData.lastName,
        role: searchUserBaseData.role,
        email: searchUserBaseData.email,
        image: "/static/image/KurumiSombra.jpg",
      };
      const last_connection = moment().toDate();
      await userModel.updateOne(
        { username: username },
        { last_connection: last_connection }
      );
      res.status(200).send({ Status: "OK", data: "User loged" });
    } else {
      req.session.user = {
        username: username,
        firstName: searchUserBaseData.firstName,
        lastName: searchUserBaseData.lastName,
        role: searchUserBaseData.role,
        email: searchUserBaseData.email,
      };
      const last_connection = moment().toDate();
      await userModel.updateOne(
        { username: username },
        { last_connection: last_connection }
      );
      res.status(200).send({ Status: "OK", data: "User loged" });
    }
  }
});

// Github Login
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user: email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    req.session.user = {
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
    };
    res.redirect("/products");
  }
);

// Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  async (req, res) => {}
);

router.get(
  "/googlecallback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    req.session.user = {
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
    };
    res.redirect("/products");
  }
);

router.get(
  "/status",
  handlePolicies(["ADMIN", "USER", "PREMIUM"]),
  (req, res) => {
    try {
      if (req.session.user) {
        res.status(200).send({ status: "OK", data: req.session.user });
      } else {
        res
          .status(200)
          .send({ status: "OK", data: "No hay datos de usuarios" });
      }
    } catch (err) {
      res.status(500).send({ status: "ERROR", data: err.message });
    }
  }
);

router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send({ status: "ERROR", data: err.message });
      } else {
        // res.status(200).send({ status: 'OK', data: `Session finalizada`})
        res.redirect("/login");
      }
    });
  } catch (err) {
    res.status(500).send({ status: "ERROR", data: err.message });
  }
});

export default router;
