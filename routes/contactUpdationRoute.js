const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const { authMiddleware } = require("../middleware/tokenAuth");
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const UserModel = require("../models/userSchema");
const OtpModel = require("../models/otpSchema");

const transporter = nodemailer.createTransport({
  // secure:true, // added new
  // service: "Outlook", // e.g., 'Gmail', 'Outlook', etc.
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILER_EMAILID,
    pass: process.env.MAILER_EMAILPASS,
  },
});

const sendOtp = async (email, otp) => {
  const mailOptions = {
    from: process.env.MAILER_EMAILID,
    to: email,
    subject: "Studynotion OTP Verification",
    html: `Hey there!

We've generated a special one-time password (OTP) just for you:
<br><br>
<b style="font-size:1.6rem">OTP: ${otp}</b>
<br><br>
Use this code to verify your identity and access your Studynotion account securely.
<br><br>
Remember, this OTP is valid for a 5 minutes only, so make sure to enter it quickly!
<br><br>
If you didn't request this OTP, no need to worry - your account is still safe. Just ignore this email and let us know if you have any concerns.
<br><br>
Happy learning with Studynotion! 🎓
<br><br>
Best regards,<br>
The Studynotion Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
};
// update phone number or email using otp verification
router.get("/sendotp", async (req, res) => {
  const otpValue = Math.floor(100000 + Math.random() * 900000);
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const existingOtp = await OtpModel.findOne({
      user: req.user.id,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
    });
    if (existingOtp) {
      return res.status(401).json({
        success: false,
        message: "Otp generated already, please try again after expiration",
      });
    }

    const newOtp = new OtpModel({
      otp: otpValue,
      user: req.user.id,
    });
    await newOtp.save();

    const sent = await sendOtp(user.email, otpValue);
    if (sent) {
      return res.status(201).json({
        success: true,
        message: `OTP sent successfully to ${user.email}`,
      });
    } else {
      return res.status(304).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
});

router.get("/verify", async (req, res) => {
  const otpValue = req.query.otp;
  const now = new Date();
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const otp = await OtpModel.findOne({ user: req.user.id }).sort({
      createdAt: -1,
    });

    if (!otp || otp.verified) {
      return res.status(400).json({
        success: false,
        message: "No OTP found or already verified",
      });
    }

    // Define the expiration time (e.g., 5 minutes)
    const otpExpirationTimeInMinutes = 5;
    const otpExpirationMs = otpExpirationTimeInMinutes * 60 * 1000; // convert minutes to milliseconds

    // Calculate the time difference
    const otpCreationTime = otp.createdAt;
    const timeDifference = now - otpCreationTime;
    if (timeDifference > otpExpirationMs) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }
    if (otp.otp != otpValue) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }
    otp.verified = true;
    await otp.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
});
module.exports = router;
