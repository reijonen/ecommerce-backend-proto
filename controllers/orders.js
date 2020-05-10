const ordersRouter = require("express").Router();
const Order = require("../models/order");
const User = require("../models/user");
const getToken = require("../utils/getToken");
const jwt = require("jsonwebtoken");

ordersRouter.get("/", async (req, res) => {
  const orders = await Order.find({}).populate("user", { name: 1, email: 1 });
  res.json(orders.map((o) => o.toJSON()));
});

ordersRouter.get("/:id", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    const order = await Order.findById(req.params.id)
      .populate("user", { name: 1, email: 1 })
      .populate("products", { name: 1, price: 1 });

    if (
      user.privilege === 1 ||
      user.privilege === 2 ||
      user._id === order.user._id
    ) {
      res.json(order.toJSON());
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

//create order
ordersRouter.post("/", async (req, res) => {
  const body = req.body;
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const newOrder = new Order({
      user: decodedToken.id,
      products: [...body.products],
      payment: body.payment,
      status: "pending",
      address: { ...body.address },
    });
    const user = await User.findById(decodedToken.id);
    const order = await newOrder.save();
    user.orders = user.orders.concat(order._id);
    await user.save();
    res.json(order.toJSON());
  }
});

//edit order status
ordersRouter.put("/:id/status", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 1 || user.privilege === 2) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate("products");
      res.json(updatedOrder.toJSON());
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

ordersRouter.put("/:id/completepayment", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 1 || user.privilege === 2) {
      const order = await Order.findById(req.params.id);
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          payment: {
            complete: req.body.paymentComplete,
            method: order.payment.method,
          },
        },
        { new: true }
      ).populate("products");
      res.json(updatedOrder.toJSON());
    }
  }
});

ordersRouter.delete("/:id", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 1 || user.privilege === 2) {
      await Order.findByIdAndRemove(req.params.id);
      res.status(204).end();
    }
  }
});

module.exports = ordersRouter;
