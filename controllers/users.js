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
    const user = await User.findById(req.params.id)
      .populate({
        path: "orders",
        select: "payment products status",
        populate: {
          path: "products",
          model: "Product",
          select: "info name",
        },
      })
      .populate("shoppingcart", { name: 1, info: 1 });

    if (decodedToken.id === req.params.id || user.privilege === 2) {
      res.json(user.toJSON());
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }
});

usersRouter.put("/:id/editshoppingcart", async (req, res) => {
  const body = req.body;
  await User.findByIdAndUpdate(
    req.params.id,
    { shoppingcart: [...body.products] },
    { new: true }
  );
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
  } else {


    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      privilege: body.privilege,
      passwordHash,
    });

    const savedUser = await user.save();


    res.json(savedUser);
  }
});

module.exports = usersRouter;
