const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
      otp: {
        type: Number,
        require: true,
      },
      verified: {
        type: Boolean,
        require: true,
        default: false,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // OTP expires after 5 minutes
      },
    },
    {
      timestamps: true,
    }
  );

  const OtpModel = mongoose.model("otps", otpSchema);
  module.exports = OtpModel
