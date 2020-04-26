const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users.map((u) => u.toJSON()));
});

usersRouter.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).populate("blogs");
  res.json(user.toJSON());
});

usersRouter.post("/", async (req, res) => {
  const body = req.body;

  if (body.password.length < 4) {
    return res
      .status(400)
      .json({ error: "Password must be over 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

module.exports = usersRouter;
