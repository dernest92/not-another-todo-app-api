const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const Category = require("./category");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please provide a valid email address");
        }
      }
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain 'Password'");
        }
      },
      trim: true
    },
    tokens: [{ token: { type: String, require: true } }]
  },
  {
    timestamps: true
  }
);

// Hash plain text password before saving
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete all tasks with user
userSchema.pre("remove", async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  await Category.deleteMany({ owner: user._id });
  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login");
    }

    return user;
  } catch (e) {
    return e;
  }
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
});

userSchema.virtual("categories", {
  ref: "Category",
  localField: "_id",
  foreignField: "owner"
});

const User = mongoose.model("User", userSchema);

module.exports = User;
