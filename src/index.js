const express = require("express");
const cors = require("cors");
const path = require("path");

//Connect to databse
require("./db/mongoose");

// Load Routers
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const categoryRouter = require("./routers/category");

// Load middleware
const auth = require("./middleware/auth");

// Express
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(taskRouter);
app.use(categoryRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../public")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/index.html"));
  });
}

app.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
