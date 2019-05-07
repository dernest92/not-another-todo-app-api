const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "User"
  }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
