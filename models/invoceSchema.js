const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    courseId: {
      type: [mongoose.Schema.Types.ObjectId],
      require: true,
    },
    totalPrice: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const InvoiceModel = mongoose.model("invoices", invoiceSchema);

module.exports = InvoiceModel;
