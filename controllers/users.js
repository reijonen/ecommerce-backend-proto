const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const getToken = require("../utils/getToken");
const jwt = require("jsonwebtoken");

//get all users;
usersRouter.get("/", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(decodedToken.id);
    if (user.privilege === 2) {
      const workers = await User.find({ privilege: 1 });
      const admins = await User.find({ privilege: 2 });
      const response = { workers: [], admins: [] };
      response.workers = workers.map((u) => u.toJSON());
      response.admins = admins.map((u) => u.toJSON());
      res.json(response);
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

//get user by id
usersRouter.get("/:id", async (req, res) => {
  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const user = await User.findById(req.params.id).populate({
      path: "orders",
      select: "payment products status",
      populate: {
        path: "products",
        model: "Product",
        select: "info name",
      },
    });

    if (decodedToken.id === req.params.id || user.privilege === 2) {
      res.json(user.toJSON());
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

usersRouter.put("/editshoppingcart", async (req, res) => {
  //query {prod_id: xxx, type: "add" || "remove"}

  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    const body = req.body;
    const user = await User.findById(decodedToken.id);
    if (body.type === "add") {
      user.shoppingcart = user.shoppingcart.concant(body.prod_id);
    } else if (body.type === "remove") {
      user.shoppingcart = user.shoppingcart.filter((i) => i !== body.prod_id);
    }

    await user.save();
  }
});

//create new user / register
usersRouter.post("/register", async (req, res) => {
  const body = req.body;

  if (body.password.length < 4) {
    return res
      .status(400)
      .json({ error: "Password must be over 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

usersRouter.post("/registeradmin", async (req, res) => {
  const body = req.body;

  const token = getToken.getToken(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const requestingUser = await User.findById(decodedToken.id);
  if (!requestingUser || requestingUser.privilege !== 2) {
    return res.status(403).json({ error: "forbidden" });
  }

  if (!body.password || body.password.length < 4) {
    return res
      .status(400)
      .json({ error: "Password must be over 3 characters long" });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = new User({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    privilege: body.privilege,
    passwordHash,
  });

  const savedUser = await user.save();
  res.json(savedUser);
});

module.exports = usersRouter;
