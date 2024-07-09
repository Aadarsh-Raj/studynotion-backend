const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoute = require("./routes/userRoute");
const courseRoute = require("./routes/couseRoute");
const orderRoute = require("./routes/orderRoute");
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
app.use(
  "/api/otp",
  authMiddleware(["student", "instructor", "admin"]),
  contactVerificationRoute
);

// crud invoice/order
app.use("/api/order",authMiddleware(["student", "instructor", "admin"]), orderRoute);


app.listen(process.env.PORT, () => {
  console.log(
    `Server is high and running at http://localhost:${process.env.PORT}`
  );
});

// click to enroll --> payment gateway --> create invoice
