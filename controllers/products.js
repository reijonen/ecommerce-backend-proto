const productsRouter = require("express").Router();
const Product = require("../models/product");

productsRouter.get("/", async (req, res) => {
	const products = await Product.find({});
	res.json(products.map((p) => p.toJSON()));
});

productsRouter.get("/:id", async (req, res) => {
	const p = await Product.find(req.params.id);
	res.json(p.toJSON());
});

module.exports = productsRouter;
