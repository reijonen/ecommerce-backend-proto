const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const groupSchema = new mongoose.Schema({
  admins: {},
  users: {},
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
