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
// get student enrolled courses
const getStudentCourseWithId = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const result = await CourseModel.find({
      studentsEnrolled: { $in: [req.user.id] },
    });

    res.status(200).json({
      success: true,
      message: "Course found",
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
    const newResult = courses.map((course) => {
      let sum = 0;
      if (course.ratingAndReviews && course.ratingAndReviews.length > 0) {
        course.ratingAndReviews.forEach((rating) => {
          sum += rating.rating;
        });
      }
      const totalRating = (sum / (course.ratingAndReviews.length * 5)) * 5;
      return {
        ...course.toObject(),
        totalRating: totalRating ? totalRating : 0,
      };
    });

    res.status(201).json({
      success: true,
      message: "Courses Found",
      result: newResult,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
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

const giveRating = async (req, res) => {
  const courseId = Object.keys(req.query)[0];
  const rating = req.query[courseId];
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Invalid course",
      });
    }
    if (!course.studentsEnrolled.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "First enroll yourself",
      });
    }

    const existingRatingIndex = course.ratingAndReviews.findIndex(
      (ratingObj) => ratingObj.user.toString() === req.user.id
    );
    if (existingRatingIndex !== -1) {
      // If user already rated, update the existing rating
      course.ratingAndReviews[existingRatingIndex].rating = parseInt(rating);
    } else {
      course.ratingAndReviews.push({
        user: req.user.id,
        rating: parseInt(rating),
      });
    }
    await course.save();
    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
const giveReview = async (req, res) => {
  const courseid = req.params.courseid;
  const review = req.body.review;
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const course = await CourseModel.findById(courseid);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Invalid course",
      });
    }
    if (!course.studentsEnrolled.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "First enroll yourself",
      });
    }
    const existingReviewIndex = course.ratingAndReviews.findIndex(
      (item) => item.user.toString() === req.user.id.toString()
    );
    if (existingReviewIndex !== -1) {
      // Update the existing review
      course.ratingAndReviews[existingReviewIndex].reviews = review;
    } else {
      // Add a new review
      course.ratingAndReviews.push({
        user: req.user.id,
        reviews: review,
      });
    }
   
    await course.save();
    res.status(200).json({
      success: true,
      message: "Review uploaded successfully",
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

const updateCourse = async (req, res) => {
  const courseId = req.params.courseid;
  const key = Object.keys(req.query)[0];
  const value = req.query[key];

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.statur(404).json({
        success: false,
        message: "User not found",
      });
    }
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    if (req.user.id != course.instructor) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }
    if (!value || key === "thumbnail") {
      return res.status(401).json({
        success: false,
        message: "Invalid inputs",
      });
    }

    course[key] = value;
    await course.save();

    res.status(201).json({
      success: true,
      message: "Course updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
const updateCourseImages = async (req, res) => {
  const courseId = req.params.courseid;
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.statur(404).json({
        success: false,
        message: "User not found",
      });
    }
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    if (req.user.id != course.instructor) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const uploadedImage = req.files.map((file) => file.path);
    console.log(uploadedImage);
    course.thumbnail = uploadedImage;
    await course.save();
    res.status(201).json({
      success: true,
      message: "Course images uploaded successfully",
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
  createCourse,
  getTeacherCourseWithId,
  getAllCourses,
  giveRating,
  giveReview,
  enrollStudent,
  updateCourseImages,
  getStudentCourseWithId,
  updateCourse,
};
