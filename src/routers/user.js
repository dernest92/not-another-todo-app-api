const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const mailer = require("../emails/account");

const userRouter = new express.Router();

userRouter.get("/api/users/me", auth, async (req, res) => {
  res.send(req.user);
});

userRouter.post("/api/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    // mailer.sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

userRouter.post("/api/users/login", async (req, res) => {
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

userRouter.post("/api/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );
    await req.user.save();
    res.send("you've been logged out");
  } catch (e) {
    res.status(500).send({ error: "server error" });
  }
});

userRouter.post("/api/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("you've been logged out of all session");
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

userRouter.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

userRouter.patch("/api/users/me", auth, async (req, res) => {
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

userRouter.delete("/api/users/me", auth, async (req, res) => {
  try {
    // mailer.goodbye(req.user.email, req.user.name);
    await req.user.remove();
    res.send("profile deleted");
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      console.log("file error");
      return cb(new Error("Invalid file type"));
    }
    console.log("file uploaded");
    cb(undefined, true);
  }
});

userRouter.post(
  "/api/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    res.send("image uploaded");
    await req.user.save();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

userRouter.delete("/api/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

userRouter.get("/api/users/:id/avatar", async (req, res) => {
  console.log("get user avatar");
  try {
    const user = await User.findById(req.params.id);
    if (!user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = userRouter;
