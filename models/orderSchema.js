const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "courses"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "users",
    },
    price: {
      type: Number,
      require: true,
    },
    createdAt: {
      type: Date,
      require: true,
      default: Date.now,
    },
    transactionId: {
      type: String,
      require: false,
    },
    modeOfPayment: {
      type: String,
      require: false,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("orders", orderSchema);

module.exports = OrderModel;
