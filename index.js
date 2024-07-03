const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoute = require("./routes/userRoute");
const courseRoute = require("./routes/couseRoute");
const dotenv = require("dotenv");
const { authMiddleware } = require("./middleware/tokenAuth");
const contactVerificationRoute = require("./routes/contactUpdationRoute");
const morgan = require("morgan");
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
app.use(morgan("dev"));
// crud user
app.use("/api/user", userRoute);
// crud course
app.use("/api/course", courseRoute);
// otp verification route
app.use("/api/otp",authMiddleware(["student", "instructor", "admin"]),contactVerificationRoute)
// crud invoice
// app.use("/api/invoice");
app.listen(process.env.PORT, () => {
  console.log(
    `Server is high and running at http://localhost:${process.env.PORT}`
  );
});
