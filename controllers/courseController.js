const upload = require("../middleware/uploadImage");
const cloudinary = require("cloudinary");
// create course
const CourseModel = require("../models/courseSchema");
const UserModel = require("../models/userSchema");

//  courseName, courseDescription, instructor, whatWillYouLearn, price, thumbnail
const createCourse = async (req, res) => {
  try {
    const courseName = req.body.courseName;
    const courseDescription = req.body.courseDescription;
    const instructor = req.user.id;
    const whatYouWillLearn = req.body.whatYouWillLearn;
    const price = req.body.price;
    if (
      courseName == "" ||
      courseDescription == "" ||
      whatYouWillLearn == "" ||
      price == ""
    ) {
      return res.status(403).json({
        success: false,
        message: "Fill the required fields",
      });
    }
    const uploadedImage = req.files.map((file) => file.path);
    await CourseModel.create({
      courseName,
      courseDescription,
      instructor,
      whatYouWillLearn,
      price,
      thumbnail: uploadedImage,
    });
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      result: uploadedImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};

// get own course for instructor
const getTeacherCourseWithId = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await CourseModel.find({ instructor: req.user.id });
    res.status(201).json({
      success: true,
      message: "Course Found",
      result: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};

// get all courses

const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({});

    res.status(201).json({
      success: true,
      message: "Courses Found",
      result: courses,
    });
  } catch (error) {}
};

// enroll student to the course
const enrollStudent = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const course = await CourseModel.findById(req.params.courseid);
    if (!user || !course) {
      return res.status(404).json({
        success: false,
        message: "User or course not found",
      });
    }
    if (course.studentsEnrolled.includes(req.user.id)) {
      return res.status(301).json({
        success: false,
        message: "You have already enrolled",
      });
    }

    await CourseModel.findByIdAndUpdate(req.params.courseid, {
      $push: { studentsEnrolled: req.user.id },
    });

    res.status(201).json({
      success: true,
      message: "You are enrolled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
// get courses of particular student
module.exports = {
  createCourse,
  getTeacherCourseWithId,
  getAllCourses,
  enrollStudent,
};
