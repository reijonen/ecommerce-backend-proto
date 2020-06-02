const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (req, res) => {
  const body = req.body;

  const user = await User.findOne({
    email: body.email,
  }).populate("shoppingcart", { name: 1, price: 1 });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  res.status(200).send({
    token,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user._id,
      shoppingcart: user.shoppingcart,
    },
  });
});

loginRouter.post("/admin", async (req, res) => {
  const body = req.body;

  const user = await User.findOne({ email: body.email });
  if (!user) {
    return res.status(401).json({ error: "invalid email or password" });
  }
  if (user.privilege === 0) {
    return res.status(403).json({ error: "administrator access required" });
  }
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  res.status(200).send({
    token,
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user._id,
    privilege: user.privilege,
  });
});

module.exports = loginRouter;
