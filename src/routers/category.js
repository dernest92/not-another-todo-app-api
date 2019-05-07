const express = require("express");
const Category = require("../models/category");
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/category", auth, async (req, res) => {
  console.log(req.body);
  const category = new Category({
    ...req.body,
    owner: req.user._id
  });

  try {
    await category.save();
    res.status(201).send(category);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

router.get("/category", auth, async (req, res) => {
  try {
    const user = await req.user.populate({ path: "categories" }).execPopulate();
    res.send(user.categories);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

router.delete("/category/:id", auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!category) {
      return res.status(404).send("Task not found");
    }
    await category.remove();
    res.send("removed task");
  } catch (e) {
    res.status(500).send(e);
    console.log("delete task route", e);
  }
});

module.exports = router;
