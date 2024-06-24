const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoute = require("./routes/userRoute");
const dotenv = require("dotenv");
app.use(cors({ origin: "*" }));
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Db connected successfully");
  })
  .catch((e) => {
    console.log(e);
  });

// crud user
app.use("/api/user", userRoute);
// crud course
// app.use("/api/course");
// // crud invoice
// app.use("/api/invoice");
app.listen(process.env.PORT, () => {
  console.log(
    `Server is high and running at http://localhost:${process.env.PORT}`
  );
});
