const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const taskRouter = new express.Router();

taskRouter.post("/api/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

// GET /tasks?sortBy=createdAt_asc
taskRouter.get("/api/tasks", auth, async (req, res) => {
  const match = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  const options = {};

  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
  }

  if (req.query.skip) {
    options.skip = parseInt(req.query.skip);
  }

  options.sort = {};
  if (req.query.sortBy) {
    let [key, val] = req.query.sortBy.split("_");
    options.sort[key] = val === "asc" ? 1 : -1;
  }

  try {
    const user = await req.user
      .populate({ path: "tasks", match, options })
      .execPopulate();
    res.send(user.tasks);
    console.log(user);

    // const tasks = await Task.find({});
    // res.status(200).send(tasks);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

taskRouter.get("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).send("no task found");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

taskRouter.patch("/api/tasks/:id", auth, async (req, res) => {
  // array of fields that may be updated
  const allowedUpdates = ["description", "completed"];

  // field attempting to be updated
  const updates = Object.keys(req.body);

  // Will be false if an invalid updated is attempted
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  // If invalid, send error
  if (!isValidOperation) {
    return res.status(400).send("update invalid");
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    // if no task is returned send 404 error
    if (!task) {
      return res.status(404).send("no task found");
    }

    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    // other errors
    res.status(400).send(e);
  }
});

taskRouter.delete("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).send("Task not found");
    }
    await task.remove();
    res.send("removed task");
  } catch (e) {
    res.status(500).send(e);
    console.log("delete task route", e);
  }
});

module.exports = taskRouter;
