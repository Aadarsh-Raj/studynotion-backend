const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// register user

const UserModel = require("../models/userSchema");

const registerUser = async (req, res) => {
  try {
    
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role.toLowerCase();
    const name = firstName + " " + lastName;
    const userObject = {
      email: email,
      name: name,
      password: password,
      role: role,
    };
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({
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
    console.log(error);
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
          const data = jwt.veriry(user.token, process.env.JWT_SECRET_KEY);
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
// update user
const updateUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
// delete user
const deleteUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};


// log out user
const logoutUser = async (req, res)=>{
    try {
        const user = await UserModel.findById(req,user.id);
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        
        if(!user.token){
            res.status(400).json({
                success: false,
                message: "User already logged out"
            }
            )
        };
        await UserModel.findByIdAndUpdate(req.user.id,{
            token: null
        });
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        }
        )
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  logoutUser
};
