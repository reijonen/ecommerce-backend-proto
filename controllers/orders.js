const ordersRouter = require("express").Router();
const Order = require("../models/order");
const User = require("../models/user");

ordersRouter.get("/", async (req, res) => {
  const orders = await Order.find({}).populate("user", { name: 1, email: 1 });
  res.json(orders.map((o) => o.toJSON()));
});

ordersRouter.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", { name: 1, email: 1 })
    .populate("products", { name: 1, price: 1 });
  res.json(order.toJSON());
});

//create order
ordersRouter.post("/", async (req, res) => {
  const body = req.body;
  const newOrder = new Order({
    user: body.userId,
    products: [...body.products],
    payment: body.payment,
    status: "pending",
    address: { ...body.address },
  });
  const user = await User.findById(body.userId);
  const order = await newOrder.save();
  user.orders = user.orders.concat(order._id);
  await user.save();
  res.json(order.toJSON());
});

//edit order status
ordersRouter.put("/:id/status", async (req, res) => {
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).populate("products");
  res.json(updatedOrder.toJSON());
});

ordersRouter.put("/:id/completepayment", async (req, res) => {
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
});

ordersRouter.delete("/:id", async (req, res) => {
  await Order.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

module.exports = ordersRouter;
