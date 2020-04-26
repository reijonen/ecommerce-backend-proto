const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	products: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		},
	],
	payment: {
		method: {
			type: String,
			required: true,
		},
		complete: {
			type: Boolean,
			default: false,
		},
	},
	status: {
		type: String,
		required: true,
	},
});

orderSchema.set("toJSON", {
	transoform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
