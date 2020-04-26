const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
	},
	info: {
		type: String,
		required: true,
		minlength: 5,
	},
	price: {
		type: Number,
		required: true,
	},
	stock: {
		type: Number,
		default: 0,
	},
	category: {
		type: [String],
		required: true,
	},
	incompleteOrders: {
		type: Number,
		default: 0,
	},
});

productSchema.set("toJSON", {
	transoform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Task = mongoose.model("Note", taskSchema);

module.exports = Task;
