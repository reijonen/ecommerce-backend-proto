//import utils
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

//import express
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");

//import routers ./controllers
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const productsRouter = require("./controllers/products");
const ordersRouter = require("./controllers/orders");
const categoriesRouter = require("./controllers/categories");

//import and connect mongoose
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((e) => {
    logger.error("Error connection to mongoDB: ", e.message);
  });

//express stuff
app.use(cors());
//app.use(express.static("build"));
app.use(express.json());
app.use(middleware.reqLogger);

//express routers
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", categoriesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
