const productsRouter = require("express").Router();
const Product = require("../models/product");
const getToken = require("../utils/getToken");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Category = require("../models/category");

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
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 2) {
      let categories = [];
      try {
        await body.categories.map(async (c) => {
          const tmp = await Category.find({ name: c });
          if (tmp[0] === undefined) {
            try {
              const newCategory = new Category({ name: c, products: [] });
              const savedCategory = await newCategory.save();
              categories.concat(savedCategory._id);
            } catch (e) {
            }
          } else {
            categories.push(tmp[0]._id);
          }
        });

        const product = new Product({
          name: body.name,
          info: body.info,
          price: body.price,
          stock: body.stock ? body.stock : 0,
          categories: [...categories],
          imageUrl: body.imageUrl === "" ? undefined : body.imageUrl,
        });
        const savedProduct = await product.save();
        categories.map(async (c) => {
          try {
            const tmp = await Category.findById(c);
            Category.findByIdAndUpdate(
              c,
              {
                name: tmp.name,
                products: [...tmp.prodtucts, savedProduct._id],
              },
              { new: true }
            );
          } catch (e) {
          }
        });
        res.json(savedProduct.toJSON());
      } catch (e) {
      }
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

//edit product
productsRouter.put("/:id", async (req, res) => {
  const body = req.body;
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 2 || user.privilege === 1) {
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
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

//delete product
productsRouter.delete("/:id", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 2) {
      await Product.findByIdAndRemove(req.params.id);
      res.status(204).end();
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

module.exports = productsRouter;
