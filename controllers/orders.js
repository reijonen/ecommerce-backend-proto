const ordersRouter = require("express").Router();
const Order = require("../models/Order");

ordersRouter.get("/", async (req, res) => {
	const orders = await Order.find({});
	res.json(orders.map((o) => o.toJSON()));
});

ordersRouter.get("/:id", async (req, res) => {
	const order = await Order.find(req.params.id).populate("products", "user");
	res.json(order.toJSON());
});

module.exports = ordersRouter;
