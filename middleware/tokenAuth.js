const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const UserModel = require("../model/userModel");
dotenv.config();

const authMiddleware = async (req, res, next)=>{
    try {
        const tokenFromHeaders =req.headers.authorization;
        if(!tokenFromHeaders){
            return res.json({
                success: false,
                message: "Token missing, contact with developer"
            })
        }
        const data = jwt.verify(tokenFromHeaders, process.env.JWT_SECRET_KEY);
        
    } catch (error) {
        console.log(error)
    }
}


module.exports = {authMiddleware}