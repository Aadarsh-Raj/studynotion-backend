const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const UserModel = require("../models/userSchema");
dotenv.config();

const authMiddleware = (role) => async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }
    const tokenFromHeaders = authorizationHeader.split(' ')[1];
    if (!tokenFromHeaders) {
      return res.status(401).json({
        success: false,
        message: "Token missing, contact the developer",
      });
    }
    const data = jwt.verify(tokenFromHeaders, process.env.JWT_SECRET_KEY);

    if (!data || !data.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }
    const user = await UserModel.findById(data.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (role.includes(data.role)) {
      req.user = user;
      next();
    } else {
       res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { authMiddleware };
