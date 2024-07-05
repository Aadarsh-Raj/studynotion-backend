const express = require("express");
const { authMiddleware } = require("../middleware/tokenAuth");
const { upload } = require("../middleware/uploadImage");

const router = express.Router();
const courseController = require("../controllers/courseController");

// create course
router.post(
  "/create",
  authMiddleware(["instructor"]),
  upload.array("thumbnail"),
  courseController.createCourse
);

// get teacher courses with id
router.get(
  "/getcourses/:teacherid",
  authMiddleware(["instructor", "student", "admin"]),
  courseController.getTeacherCourseWithId
);

// get all courses 
router.get("/courses",courseController.getAllCourses)
// give rating for particular course
router.put("/rating/upload",   authMiddleware(["instructor", "student", "admin"]),
courseController.giveRating
)
// give review for particular course

router.put("/review/upload/:courseid",   authMiddleware(["instructor", "student", "admin"]),
courseController.giveReview
)
// get id of user and course and then enroll student to the course
router.patch("/enroll/:courseid",authMiddleware(["student"]), courseController.enrollStudent )






module.exports = router;