const productsRouter = require("express").Router();
const Product = require("../models/product");

productsRouter.get("/", async (req, res) => {
  const products = await Product.find({});
  res.json(products.map((p) => p.toJSON()));
});

productsRouter.get("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id);
  res.json(p.toJSON());
});

//create product
productsRouter.post("/", async (req, res) => {
  const body = req.body;

  const product = new Product({
    name: body.name,
    info: body.info,
    price: body.price,
    stock: body.stock ? body.stock : 0,
    categories: [...body.categories],
  });
  const savedProduct = await product.save();
  res.json(savedProduct.toJSON());
});

//edit product
productsRouter.put("/:id", async (req, res) => {
  const body = req.body;

  const product = {
    name: body.name,
    info: body.info,
    price: body.price,
    stock: body.stock,
  };

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    product,
    { new: true }
  );
  res.json(updatedProduct.toJSON());
});

//delete product
productsRouter.delete("/:id", async (req, res) => {
  await Product.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

module.exports = productsRouter;
