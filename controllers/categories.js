const categoriesRouter = require("express").Router();
const Category = require("../models/category");

categoriesRouter.get("/", async (req, res) => {
  const categories = await Category.find({});
  res.json(categories.map((c) => c.toJSON()));
});

module.exports = categoriesRouter;
