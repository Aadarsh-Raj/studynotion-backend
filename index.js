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
dotenv.config();
const stripe = require("stripe")(
  // This is your test secret API key.
  process.env.STRIPE_SECRET_KEY,
  {
    apiVersion: "2023-10-16",
  }
);

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
// integrated stripe

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
app.use(
  "/api/order",
  authMiddleware(["student", "instructor", "admin"]),
  orderRoute
);

app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack to the console
  res
    .status(500)
    .json({ success: false, message: "Something went wrong, try again later" });
});
app.listen(process.env.PORT, () => {
  console.log(
    `Server is high and running at http://localhost:${process.env.PORT}`
  );
});

