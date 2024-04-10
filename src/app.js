import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import chatModel from "../src/models/message.models.js";
import chatRouter from "./routes/chat.routes.js";
import sessionRouter from "./routes/session.routes.js";
import viewsRouter from "./routes/views.routes.js";
import mocksRouter from "./mocks/productsMocks.js";
import MongoSingleton from "./services/mongo.singleton.js";
import addLogger from "./services/winston.logger.js";
import userRouter from "./routes/users.routes.js";

import config from "./config.js";

try {
  // Mongo Atlas Connect
  await MongoSingleton.getInstance();

  // Express config
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "*",
      methods: "GET, POST, PUT, DELETE",
    })
  );

  const swaggerOptions = {
    definition: {
      openapi: "3.0.1",
      info: {
        title: "Swagger documentation for Video-games Fake Store API",
        description:
          "This documentation it's about API Video-games Fake Store API",
      },
    },
    apis: ["./src/docs/**/*.yaml"],
  };

  const specs = swaggerJsdoc(swaggerOptions);

  // Session
  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: config.MONGOOSE_URL,
        mongoOptions: {},
        ttl: 1800,
      }),
      secret: config.MONGOOSE_STORE_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  // Cookie
  app.use(cookieParser(config.SIGNEDCOOKIECODE));

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Logger
  app.use(addLogger);

  // Endpoints
  app.use("/api/products", productsRouter);
  app.use("/api/carts", cartsRouter);
  app.use("/api/sessions", sessionRouter);
  app.use("/api/users", userRouter);
  app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
  app.use("/mock", mocksRouter);

  // Logger Endpoint test
  app.get("/logger", (req, res) => {
    req.logger.fatal("Fatal message, level: 0");
    req.logger.error("Error message, level: 1");
    req.logger.warning("Warning message, level: 2");
    req.logger.info("Info message, level: 3");
    req.logger.http("Http message, level: 4");
    req.logger.debug("Debug message, level: 5");
    res.status(200).send("Logger test");
  });

  // Chat Endpoint
  app.use("/", chatRouter);

  // Views Endpoint
  app.use("/", viewsRouter);

  app.engine("handlebars", handlebars.engine());
  app.set("views", `${config.__DIRNAME}/views`);
  app.set("view engine", "handlebars");

  app.use("/static", express.static(`${config.__DIRNAME}/public`));

  const httpServer = app.listen(config.PORT, () => {
    console.log(`Express server active: http://localhost:${config.PORT}`);
  });

  app.use((err, req, res, next) => {
    const code = err.code || 500;
    const message = err.message || "Internal error";
    return res.status(code).send({ status: "ERR", data: message });
  });

  // WebSocket things
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
      credentials: false,
    },
  });

  app.set("io", io);

  io.on("connection", async (socket) => {
    socket.on("user_connected", async (data) => {
      const chat_message = await chatModel.find();
      socket.broadcast.emit("user_connected", data);
      io.emit("chatLogs", chat_message);
      console.log(`Chat actual enviado a ${socket.id}`);
    });

    socket.on("message", async (data) => {
      const pushChat = await chatModel.create(data);

      io.emit("messageLogs", pushChat);
    });
  });
} catch (err) {
  console.log(`Error initializing server (${err.message})`);
}
