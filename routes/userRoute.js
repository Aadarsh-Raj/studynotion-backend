const express = require("express");
const userController = require("../controllers/userController")
const router = express.Router();


// create user 
router.post("/register", userController.registerUser);


// get login
router.post("/login",userController.loginUser);

// update user
router.put("/update",userController.updateUser);
// delete user 
router.delete("/delete", userController.deleteUser);


// logout user
router.post("/logout", userController.logoutUser)

module.exports = router