const mongoose = require("mongoose");

// Connect to the server
mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});
