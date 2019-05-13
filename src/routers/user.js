const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const userRouter = new express.Router();

userRouter.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

userRouter.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
    console.log(user);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

userRouter.post("/users/guest", async (req, res) => {
  const identifier = "guest" + Math.floor(Math.random() * 1000);
  const user = new User({
    name: identifier,
    email: `${identifier}@email.com`,
    password: `${identifier}pass123`,
    isGuest: true
  });

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
    console.log(user);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

userRouter.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );
    await req.user.save();
    if (req.user.isGuest) {
      req.user.remove();
    }
    res.send("you've been logged out");
  } catch (e) {
    res.status(500).send({ error: "server error" });
  }
});

userRouter.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("you've been logged out of all session");
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

userRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

userRouter.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];

  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(405).send("Update not allowed");
  }
  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send("frick");
    console.log(e);
  }
});

userRouter.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send("profile deleted");
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

module.exports = userRouter;
