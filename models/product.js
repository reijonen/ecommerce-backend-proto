const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
  },
  content: {
    type: String,
    required: true,
    minlength: 5,
  },
  status: {
    type: [Number],
    default: [0],
  },
});

const Task = mongoose.model("Note", taskSchema);

module.exports = Task;
