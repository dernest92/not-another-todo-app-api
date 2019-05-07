const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      trim: true
    },
    notes: {
      type: String,
      require: false,
      trim: true
    },
    priority: {
      type: String,
      require: false,
      trim: true
    },
    date: {
      type: mongoose.Schema.Types.Mixed,
      require: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Category"
    }
  },
  {
    timestamps: true
  }
);

taskSchema.pre("save", async function(next) {
  console.log("ran task middleware");
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
