import { Router, query } from "express";

const router = Router();

router.get("/login", async (req, res) => {
  if (req.session.user) {
    res.redirect("/products");
  } else {
    res.render("login", {});
  }
});

router.get("/products", async (req, res) => {
  if (req.session.user) {
    res.render("products", { user: req.session.user });
  } else {
    res.redirect("login");
  }
});

router.get("/register", async (req, res) => {
  res.render("register", {});
});

router.get("/buysucced", async (req, res) => {
  res.render("buysucced");
});

router.get("/buycancel", async (req, res) => {
  res.render("buycancel");
});

router.get("/restorepassword", async (req, res) => {
  if (req.query.t) {
    res.render("restorePasswordQuery", {});
  } else {
    res.render("restorePassword", {});
  }
});

router.get("/profile", async (req, res) => {
  if (req.session.user) {
    res.render("profile", { user: req.session.user });
  } else {
    res.redirect("/login");
  }
});

export default router;
