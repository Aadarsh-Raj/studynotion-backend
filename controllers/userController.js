const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// register user

const UserModel = require("../models/userSchema");
const CourseModel = require("../models/courseSchema");
const OtpModel = require("../models/otpSchema");

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const name = firstName + " " + lastName;
    const userObject = {
      email: email,
      name: name,
      password: password,
      role: role.toLowerCase(),
    };
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res.status(401).json({
        success: false,
        message: "User already Exist",
      });
    }

    await UserModel.create({ ...userObject });
    res.status(200).json({
      success: true,
      message: "User Registered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
// login user
const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await UserModel.findOne({
      email,
    });
    const password = req.body.password;
    if (user) {
      const isPasswordTrue = bcrypt.compareSync(password, user.password);
      if (!isPasswordTrue) {
        return res.status(401).json({
          success: false,
          message: "UserName or password is incorrect",
        });
      }

      const expiryDateTime = Math.floor(new Date().getTime() / 1000) + 100000;
      const payload = {
        id: user.id,
        fullName: user.name,
        role: user.role,
        exp: expiryDateTime,
      };
      let token;
      if (user.token) {
        try {
          const data = jwt.verify(user.token, process.env.JWT_SECRET_KEY);
          if (data) {
            return res.status(400).json({
              success: false,
              message: "First log out please",
            });
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
      }
      await UserModel.findByIdAndUpdate(user.id, { $set: { token: token } });
      res.json({
        success: true,
        message: "User logged in successfully",
        userName: user.name,
        token: token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// get own profile using token

const getProfile = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const userDetails = {
      userPhoto: user.photo,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhoneNumber: user.phoneNumber,
      userActive: user.active,
      userDob: user.dob,
      userAbout: user.about,
      userGender: user.gender,
      userRole: user.role,
      userWishlist: user.wishlist,
    };
    res.status(201).json({
      success: true,
      message: "User found",
      result: userDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// upload profile photo

const uploadPhoto = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const uploadedImage = req.files.map((file) => file.path);
    await UserModel.findByIdAndUpdate(req.user.id, {
      photo: `${uploadedImage}`,
    });
    res.status(201).json({
      success: true,
      message: "Profile photo uploaded successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
// update user for name, dob, gender, about
const updateUser = async (req, res) => {
  const key = Object.keys(req.query)[0];
  const value = req.query[key];

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!value) {
      return res.status(401).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    await UserModel.findByIdAndUpdate(req.user.id, {
      [key]: value,
    });

    res.status(201).json({
      success: true,
      message: `Profile ${key} updated successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateVerifiedUser = async (req, res) => {
  const key = Object.keys(req.query)[0];
  const value = req.query[key];

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
    if (!otp || !otp.verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify yourself using OTP first",
      });
    }
    if (!value) {
      return res.status(401).json({
        success: false,
        message: "Invalid inputs",
      });
    }

    user[key] = value;
    await user.save();
    await OtpModel.findOneAndDelete({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(201).json({
      success: true,
      message: `Profile ${key} updated successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// add courses to students
const addWishlistItem = async (req, res) => {
  console.log(req.params.courseid);
  try {
    const course = await CourseModel.findById(req.params.courseid);
    console.log(course);

    const user = await UserModel.findById(req.user.id);
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

    if (user.wishlist.includes(req.params.courseid)) {
      await UserModel.findByIdAndUpdate(req.user.id, {
        $pull: { wishlist: course._id },
      });

      return res.status(201).json({
        success: true,
        message: "Removed from wishlist",
      });
    }

    await UserModel.findByIdAndUpdate(req.user.id, {
      $push: { wishlist: course._id },
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
const getUserName = async (req, res) => {
  const otherUser = req.params.userid;
  try {
    const user = await UserModel.findById(otherUser);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(201).json({
      success: true,
      message: "User found",
      result: user.name,
    });
  } catch (error) {}
};
// delete user
const deleteUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};

// log out user
const logoutUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.token) {
      res.status(400).json({
        success: false,
        message: "User already logged out",
      });
    }
    await UserModel.findByIdAndUpdate(req.user.id, {
      token: null,
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  uploadPhoto,
  updateUser,
  updateVerifiedUser,
  addWishlistItem,
  getUserName,
  deleteUser,
  logoutUser,
};
