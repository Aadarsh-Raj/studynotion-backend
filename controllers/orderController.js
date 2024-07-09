const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const CourseModel = require("../models/courseSchema");
const UserModel = require("../models/userSchema");
const OrderModel = require("../models/orderSchema");
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  const courseId = req.params.courseid;
  try {
    const user = await UserModel.findById(req.user.id);
    const course = await CourseModel.findById(courseId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const orderDetails = {
      courseId: course._id,
      userId: user._id,
      price: course.price,
    };

    await OrderModel.create(orderDetails);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};

module.exports = {
  createOrder,
};
