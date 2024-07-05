const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const { authMiddleware } = require("../middleware/tokenAuth");
const { upload } = require("../middleware/uploadImage");

// create user
router.post("/register", userController.registerUser);

// get login
router.post("/login", userController.loginUser);

// get profile
router.get(
  "/myprofile",
  authMiddleware(["student", "instructor", "admin"]),
  userController.getProfile
);
// update profile photo
router.post(
  "/updatephoto",
  authMiddleware(["student", "instructor", "admin"]),
  upload.array("thumbnail"),
  userController.uploadPhoto
);
//  update user for name, dob, gender, about
router.put(
  "/update/profile",
  authMiddleware(["student", "instructor", "admin"]),
  userController.updateUser
);

// update user for email, phoneNumber and password
router.put("/update/verified/profile",   authMiddleware(["student", "instructor", "admin"]),
userController.updateVerifiedUser
)

router.get("/findname/:userid", userController.getUserName);
// wishlist
router.patch(
  "/wishlist/:courseid",
  authMiddleware(["student", "instructor", "admin"]),
  userController.addWishlistItem
);
// delete user
router.delete(
  "/delete",
  authMiddleware(["student", "instructor", "admin"]),
  userController.deleteUser
);

// logout user
router.post(
  "/logout",
  authMiddleware(["student", "instructor", "admin"]),
  userController.logoutUser
);

module.exports = router;
