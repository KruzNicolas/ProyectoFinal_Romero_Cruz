import multer from "multer";
import config from "./config.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = `${config.__DIRNAME}/public/documents`;

    if (req.body.type === "profile") {
      folder = `${config.__DIRNAME}/public/profiles`;
    } else if (req.body.type === "product") {
      folder = `${config.__DIRNAME}/public/products`;
    }
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
